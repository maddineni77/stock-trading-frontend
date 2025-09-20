import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { stockAPI, userAPI } from '../services/api';
import { formatCurrency, calculateProfitLoss, getStockColor } from '../utils/helpers';

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const getCurrentUserId = () => {
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      return user?._id || user?.userId || user?.id || null;
    } catch {
      return null;
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    setLoading(true);
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        setPortfolio([]);
        setStocks([]);
        setBalance(0);
        return;
      }
      
      const [portfolioResp, stocksResp, balanceResp] = await Promise.all([
        userAPI.getUserPortfolio(userId),
        stockAPI.getAllStocks(),
        userAPI.getUserBalance(userId)
      ]);

      const holdings = portfolioResp?.data?.stocks || portfolioResp?.data || [];
      setPortfolio(Array.isArray(holdings) ? holdings : []);
      const stocksList = stocksResp?.data || stocksResp || [];
      setStocks(Array.isArray(stocksList) ? stocksList : []);
      setBalance(balanceResp.balance || 0);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockInfo = (symbol) => {
    return stocks.find(stock => stock.symbol === symbol);
  };

  const getHoldingSymbol = (h) => h.stockSymbol || h.symbol;
  const getHoldingQuantity = (h) => h.quantity ?? h.shares ?? 0;
  const getHoldingAvgPrice = (h) => h.averagePrice ?? h.avgPrice ?? 0;

  const calculatePortfolioValue = () => {
    if (!Array.isArray(portfolio)) return 0;
    return portfolio.reduce((total, holding) => {
      const stock = getStockInfo(getHoldingSymbol(holding));
      const currentPrice = stock?.currentPrice || stock?.price || 0;
      return total + (getHoldingQuantity(holding) * currentPrice);
    }, 0);
  };

  const calculateTotalProfitLoss = () => {
    if (!Array.isArray(portfolio)) return 0;
    return portfolio.reduce((total, holding) => {
      const stock = getStockInfo(getHoldingSymbol(holding));
      const currentPrice = stock?.currentPrice || stock?.price || 0;
      const profitLoss = calculateProfitLoss(getHoldingAvgPrice(holding), currentPrice, getHoldingQuantity(holding));
      return total + profitLoss;
    }, 0);
  };

  const getPortfolioChartData = () => {
    if (!Array.isArray(portfolio)) return [];
    return portfolio.map(holding => {
      const symbol = getHoldingSymbol(holding);
      const qty = getHoldingQuantity(holding);
      const stock = getStockInfo(symbol);
      const currentPrice = stock?.currentPrice || stock?.price || 0;
      const value = qty * currentPrice;
      
      return {
        name: symbol,
        value,
        quantity: qty,
        price: currentPrice
      };
    });
  };

  const portfolioValue = calculatePortfolioValue();
  const totalProfitLoss = calculateTotalProfitLoss();
  const portfolioChartData = getPortfolioChartData();
  const totalAssets = balance + portfolioValue;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Cash Balance</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(balance)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Portfolio Value</h3>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(portfolioValue)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Assets</h3>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalAssets)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total P&L</h3>
          <p className={`text-2xl font-bold ${getStockColor(totalProfitLoss)}`}>
            {formatCurrency(totalProfitLoss)}
          </p>
        </div>
      </div>

      {portfolio.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Allocation Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Portfolio Allocation</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {portfolioChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [formatCurrency(value), name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Asset Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Asset Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium">Cash</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(balance)}</p>
                    <p className="text-sm text-gray-500">
                      {((balance / totalAssets) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-medium">Stocks</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(portfolioValue)}</p>
                    <p className="text-sm text-gray-500">
                      {((portfolioValue / totalAssets) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Stock Holdings</h3>
                <button
                  onClick={fetchPortfolioData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Market Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P&L
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allocation
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(portfolio) && portfolio.map((holding, index) => {
                    const symbol = getHoldingSymbol(holding);
                    const qty = getHoldingQuantity(holding);
                    const avg = getHoldingAvgPrice(holding);
                    const stock = getStockInfo(symbol);
                    const currentPrice = stock?.currentPrice || stock?.price || 0;
                    const marketValue = qty * currentPrice;
                    const profitLoss = calculateProfitLoss(avg, currentPrice, qty);
                    const allocation = (marketValue / portfolioValue) * 100;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {symbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stock?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {qty}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(avg)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(currentPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(marketValue)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStockColor(profitLoss)}`}>
                          {formatCurrency(profitLoss)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(allocation, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{allocation.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Empty Portfolio State */
        <div className="bg-white rounded-lg shadow">
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">💼</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Holdings Yet</h3>
            <p className="text-gray-500 mb-6">
              Your portfolio is empty. Start trading to build your stock holdings.
            </p>
            <div className="space-x-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Buy Stocks
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Browse Market
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
