import { useState, useEffect, useRef } from 'react';
import { createWebSocketConnection } from '../services/api';
import { stockAPI, userAPI, transactionAPI } from '../services/api';
import { formatCurrency, isPositiveNumber, showToast } from '../utils/helpers';
import TransactionFeed from './TransactionFeed';

const Trading = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [stocks, setStocks] = useState([]);
  const [userPortfolio, setUserPortfolio] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const pricePollingRef = useRef(null);
  const userPollingRef = useRef(null);
  const wsRef = useRef(null);
  const getCurrentUserId = () => {
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      return user?._id || user?.userId || user?.id || null;
    } catch {
      return null;
    }
  };
  const [loading, setLoading] = useState(false);
  
  // Buy form state
  const [buyForm, setBuyForm] = useState({
    userId: getCurrentUserId() || 'user1', // fallback for demo
    stockSymbol: '',
    quantity: '',
    price: ''
  });

  // Sell form state
  const [sellForm, setSellForm] = useState({
    userId: getCurrentUserId() || 'user1', // fallback for demo
    stockSymbol: '',
    quantity: '',
    price: ''
  });

  useEffect(() => {
    fetchStocks();
    fetchUserData();
    // start polling for prices every 5s
    if (pricePollingRef.current) clearInterval(pricePollingRef.current);
    pricePollingRef.current = setInterval(() => {
      fetchStocks();
    }, 5000);
    // start polling for user data every 10s
    if (userPollingRef.current) clearInterval(userPollingRef.current);
    userPollingRef.current = setInterval(() => {
      fetchUserData();
    }, 10000);
    return () => {
      if (pricePollingRef.current) clearInterval(pricePollingRef.current);
      if (userPollingRef.current) clearInterval(userPollingRef.current);
      if (wsRef.current) { try { wsRef.current.close(); } catch {} }
    };
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await stockAPI.getAllStocks();
      const list = response?.data || response || [];
      setStocks(Array.isArray(list) ? list : []);
      // bootstrap WebSocket after first stock load
      if (!wsRef.current) {
        try {
          wsRef.current = createWebSocketConnection((payload) => {
            if (!payload?.symbol) return;
            setStocks(prev => prev.map(s => s.symbol === payload.symbol ? { ...s, currentPrice: payload.price } : s));
          });
        } catch {}
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        setUserPortfolio([]);
        setUserBalance(0);
        return;
      }
      const [portfolioResponse, balanceResponse] = await Promise.all([
        userAPI.getUserPortfolio(userId),
        userAPI.getUserBalance(userId)
      ]);
      setUserPortfolio(portfolioResponse.data || []);
      setUserBalance(balanceResponse.balance || 0);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleBuySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const qty = parseInt(buyForm.quantity);
      const prc = parseFloat(buyForm.price);
      // optimistic update
      setUserBalance(prev => Math.max(0, prev - qty * prc));
      setUserPortfolio(prev => {
        const symbol = buyForm.stockSymbol;
        const existing = prev.find(h => h.stockSymbol === symbol);
        if (existing) {
          return prev.map(h => h.stockSymbol === symbol ? { ...h, quantity: (h.quantity || 0) + qty } : h);
        }
        return [...prev, { stockSymbol: symbol, quantity: qty, averagePrice: prc }];
      });

      await transactionAPI.buyStock({
        userId: getCurrentUserId() || buyForm.userId,
        stockSymbol: buyForm.stockSymbol,
        quantity: qty,
        price: prc
      });

      showToast('Stock purchased successfully!', 'success');
      setBuyForm({ ...buyForm, quantity: '', price: '' });
      fetchUserData(); // Refresh user data
    } catch (error) {
      showToast(`Error buying stock: ${error.message || error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSellSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const qty = parseInt(sellForm.quantity);
      const prc = parseFloat(sellForm.price);
      // optimistic update
      setUserBalance(prev => prev + qty * prc);
      setUserPortfolio(prev => {
        const symbol = sellForm.stockSymbol;
        return prev
          .map(h => h.stockSymbol === symbol ? { ...h, quantity: Math.max(0, (h.quantity || 0) - qty) } : h)
          .filter(h => h.quantity > 0);
      });

      await transactionAPI.sellStock({
        userId: getCurrentUserId() || sellForm.userId,
        stockSymbol: sellForm.stockSymbol,
        quantity: qty,
        price: prc
      });

      showToast('Stock sold successfully!', 'success');
      setSellForm({ ...sellForm, quantity: '', price: '' });
      fetchUserData(); // Refresh user data
    } catch (error) {
      showToast(`Error selling stock: ${error.message || error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStockPrice = (symbol) => {
    const stock = stocks.find(s => s.symbol === symbol);
    return stock?.currentPrice || stock?.price || 0;
  };

  const getPortfolioHolding = (symbol) => {
    const holding = userPortfolio.find(h => h.stockSymbol === symbol);
    return holding?.quantity || 0;
  };

  const calculateTotalCost = (quantity, price) => {
    if (!isPositiveNumber(quantity) || !isPositiveNumber(price)) return 0;
    return parseFloat(quantity) * parseFloat(price);
  };

  const canAffordBuy = () => {
    const total = calculateTotalCost(buyForm.quantity, buyForm.price);
    return total > 0 && total <= userBalance;
  };

  const canSellQuantity = () => {
    const max = getPortfolioHolding(sellForm.stockSymbol);
    const qty = parseInt(sellForm.quantity || '0');
    return qty > 0 && qty <= max;
  };

  return (
    <div className="space-y-6">
      {/* User Balance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Account Balance</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(userBalance)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Available for trading</p>
            <button
              onClick={fetchUserData}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Trading Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('buy')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'buy'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Buy Stocks
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'sell'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sell Stocks
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'buy' ? (
            /* Buy Form */
            <form onSubmit={handleBuySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Symbol
                  </label>
                  <select
                    value={buyForm.stockSymbol}
                    onChange={(e) => {
                      const selectedStock = e.target.value;
                      setBuyForm({
                        ...buyForm,
                        stockSymbol: selectedStock,
                        price: getStockPrice(selectedStock).toString()
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select a stock</option>
                    {stocks.map((stock) => (
                      <option key={stock._id} value={stock.symbol}>
                        {stock.symbol} - {stock.name} ({formatCurrency(stock.currentPrice || stock.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={buyForm.quantity}
                    onChange={(e) => setBuyForm({ ...buyForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Share
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={buyForm.price}
                    onChange={(e) => setBuyForm({ ...buyForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Current price"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Cost
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                    {formatCurrency(calculateTotalCost(buyForm.quantity, buyForm.price))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !canAffordBuy()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  if (!window.confirm(`Confirm buy ${buyForm.quantity} ${buyForm.stockSymbol} @ ${formatCurrency(buyForm.price)}?`)) {
                    e.preventDefault();
                  }
                }}
              >
                {loading ? 'Processing...' : 'Buy Stock'}
              </button>

              {!canAffordBuy() && buyForm.quantity && buyForm.price && (
                <p className="text-red-600 text-sm">
                  Insufficient balance. You need {formatCurrency(calculateTotalCost(buyForm.quantity, buyForm.price) - userBalance)} more.
                </p>
              )}
            </form>
          ) : (
            /* Sell Form */
            <form onSubmit={handleSellSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Symbol
                  </label>
                  <select
                    value={sellForm.stockSymbol}
                    onChange={(e) => {
                      const selectedStock = e.target.value;
                      setSellForm({
                        ...sellForm,
                        stockSymbol: selectedStock,
                        price: getStockPrice(selectedStock).toString()
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="">Select a stock</option>
                    {userPortfolio.map((holding) => {
                      const stock = stocks.find(s => s.symbol === holding.stockSymbol);
                      return (
                        <option key={holding._id} value={holding.stockSymbol}>
                          {holding.stockSymbol} - {holding.quantity} shares ({formatCurrency(stock?.currentPrice || stock?.price || 0)})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity (Max: {getPortfolioHolding(sellForm.stockSymbol)})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={getPortfolioHolding(sellForm.stockSymbol)}
                    value={sellForm.quantity}
                    onChange={(e) => setSellForm({ ...sellForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Share
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={sellForm.price}
                    onChange={(e) => setSellForm({ ...sellForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Current price"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Value
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                    {formatCurrency(calculateTotalCost(sellForm.quantity, sellForm.price))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !canSellQuantity()}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  if (!window.confirm(`Confirm sell ${sellForm.quantity} ${sellForm.stockSymbol} @ ${formatCurrency(sellForm.price)}?`)) {
                    e.preventDefault();
                  }
                }}
              >
                {loading ? 'Processing...' : 'Sell Stock'}
              </button>

              {!canSellQuantity() && sellForm.quantity && (
                <p className="text-red-600 text-sm">
                  You don't have enough shares. You only own {getPortfolioHolding(sellForm.stockSymbol)} shares.
                </p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Current Holdings */}
      {userPortfolio.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Current Holdings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userPortfolio.map((holding, index) => {
                  const currentPrice = getStockPrice(holding.stockSymbol);
                  const totalValue = holding.quantity * currentPrice;
                  
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {holding.stockSymbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {holding.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(currentPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(totalValue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Feed */}
      <TransactionFeed />
    </div>
  );
};

export default Trading;
