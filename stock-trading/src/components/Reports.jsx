import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { stockAPI, userAPI } from '../services/api';
import { formatCurrency, formatDateTime, getStockColor } from '../utils/helpers';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('user');
  const [userReport, setUserReport] = useState(null);
  const [stockReport, setStockReport] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [topStocks, setTopStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [userResp, stockResp, topUsersResp, topStocksResp] = await Promise.all([
        userAPI.getUserReport('user1'), // Default user
        stockAPI.getStockReport(),
        userAPI.getTopUsers(),
        stockAPI.getTopStocks()
      ]);

      setUserReport(userResp.data);
      setStockReport(stockResp.data || []);
      setTopUsers(topUsersResp.data || []);
      setTopStocks(topStocksResp.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUserReport = () => (
    <div className="space-y-6">
      {userReport && (
        <>
          {/* User Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Portfolio Value</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(userReport.portfolioValue || 0)}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Profit/Loss</h3>
              <p className={`text-2xl font-bold ${getStockColor(userReport.totalProfitLoss || 0)}`}>
                {formatCurrency(userReport.totalProfitLoss || 0)}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Trades</h3>
              <p className="text-2xl font-bold text-gray-900">
                {userReport.totalTrades || 0}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
              <p className="text-2xl font-bold text-green-600">
                {((userReport.successfulTrades || 0) / Math.max(userReport.totalTrades || 1, 1) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Portfolio Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Portfolio Distribution</h3>
            {userReport.portfolio && userReport.portfolio.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userReport.portfolio}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userReport.portfolio.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-2">
                  {userReport.portfolio.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-gray-600">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No portfolio data available</p>
            )}
          </div>

          {/* Recent Trades */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Recent Trades</h3>
            </div>
            {userReport.recentTrades && userReport.recentTrades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userReport.recentTrades.map((trade, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(trade.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {trade.stockSymbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            trade.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(trade.price)}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStockColor(trade.profitLoss || 0)}`}>
                          {formatCurrency(trade.profitLoss || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">No recent trades found</div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderStockReport = () => (
    <div className="space-y-6">
      {/* Stock Performance Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Stock Performance</h3>
        {stockReport.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockReport}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symbol" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="currentPrice" fill="#8884d8" name="Current Price" />
                <Bar dataKey="averagePrice" fill="#82ca9d" name="Average Price" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No stock data available</p>
        )}
      </div>

      {/* Stock Details Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Stock Details</h3>
        </div>
        {stockReport.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Cap</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockReport.map((stock, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stock.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(stock.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stock.volume || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(stock.marketCap || 0)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStockColor(stock.change || 0)}`}>
                      {stock.change ? `${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">No stock data available</div>
        )}
      </div>
    </div>
  );

  const renderTopPerformers = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Top Performing Users</h3>
          </div>
          <div className="p-6">
            {topUsers.length > 0 ? (
              <div className="space-y-4">
                {topUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.username || `User ${user.userId}`}</p>
                        <p className="text-sm text-gray-500">Trades: {user.totalTrades || 0}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getStockColor(user.profitLoss || 0)}`}>
                        {formatCurrency(user.profitLoss || 0)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {((user.profitLoss || 0) / Math.max(user.totalInvested || 1, 1) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No user data available</p>
            )}
          </div>
        </div>

        {/* Top Stocks */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Top Performing Stocks</h3>
          </div>
          <div className="p-6">
            {topStocks.length > 0 ? (
              <div className="space-y-4">
                {topStocks.map((stock, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{stock.symbol}</p>
                        <p className="text-sm text-gray-500">{stock.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(stock.currentPrice || 0)}</p>
                      <p className={`text-sm ${getStockColor(stock.change || 0)}`}>
                        {stock.change ? `${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No stock data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('user')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'user'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Report
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'stock'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stock Report
            </button>
            <button
              onClick={() => setActiveTab('top')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'top'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Top Performers
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {activeTab === 'user' ? 'User Performance Report' :
               activeTab === 'stock' ? 'Stock Analysis Report' :
               'Top Performers'}
            </h2>
            <button
              onClick={fetchAllReports}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Data
            </button>
          </div>

          {activeTab === 'user' && renderUserReport()}
          {activeTab === 'stock' && renderStockReport()}
          {activeTab === 'top' && renderTopPerformers()}
        </div>
      </div>
    </div>
  );
};

export default Reports;
