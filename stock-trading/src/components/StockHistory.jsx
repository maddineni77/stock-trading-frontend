import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { stockAPI } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/helpers';

const StockHistory = () => {
  const [stockHistory, setStockHistory] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStocks();
  }, []);

  // fetchStockHistory is defined below; the effect that uses it is placed after its definition

  const fetchStocks = async () => {
    try {
      const response = await stockAPI.getAllStocks();
      setStocks(response.data || []);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  const fetchStockHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await stockAPI.getStockHistory(selectedStock);
      // Transform data for chart
      const transformedData = response.data?.map(item => ({
        ...item,
        timestamp: formatDateTime(item.timestamp),
        price: parseFloat(item.price)
      })) || [];
      setStockHistory(transformedData);
    } catch (error) {
      console.error('Error fetching stock history:', error);
      setStockHistory([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStock]);

  useEffect(() => {
    if (selectedStock) {
      fetchStockHistory();
    }
  }, [selectedStock, fetchStockHistory]);

  const currentPrice = stockHistory.length > 0 ? stockHistory[stockHistory.length - 1]?.price : 0;
  const previousPrice = stockHistory.length > 1 ? stockHistory[stockHistory.length - 2]?.price : 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice ? ((priceChange / previousPrice) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stock selector */}
      <div className="flex items-center space-x-4">
        <select
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a stock</option>
          {stocks.map((stock) => (
            <option key={stock._id} value={stock.symbol}>
              {stock.symbol} - {stock.name}
            </option>
          ))}
        </select>

        <button
          onClick={fetchStockHistory}
          disabled={!selectedStock || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {selectedStock && (
        <>
          {/* Price summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedStock}</h3>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(currentPrice)}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChange >= 0 ? '+' : ''}{formatCurrency(priceChange)}
                </p>
                <p className={`text-sm ${priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Price chart */}
          {loading ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
              <p className="text-gray-500">Loading chart...</p>
            </div>
          ) : stockHistory.length > 0 ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-4">Price History</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Price']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#1d4ed8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
              <p className="text-gray-500">No price history available for this stock</p>
            </div>
          )}

          {/* Price history table */}
          {stockHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold">Recent Price History</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stockHistory.slice(-10).reverse().map((item, index) => {
                      const prevItem = index < stockHistory.length - 1 ? stockHistory[stockHistory.length - 1 - index - 1] : null;
                      const change = prevItem ? item.price - prevItem.price : 0;
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.timestamp}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.price)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change !== 0 ? `${change >= 0 ? '+' : ''}${formatCurrency(change)}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StockHistory;
