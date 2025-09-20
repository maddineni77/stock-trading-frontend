import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { stockAPI, userAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState({
    totalUsers: 0,
    totalStocks: 0,
    totalTrades: 0,
    totalVolume: 0
  });
  const [recentTrades, setRecentTrades] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [stockStats, setStockStats] = useState([]);
  const [loading, setLoading] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [stocksResp, topUsersResp, topStocksResp, stockReportResp] = await Promise.all([
        stockAPI.getAllStocks(),
        userAPI.getTopUsers(),
        stockAPI.getTopStocks(),
        stockAPI.getStockReport()
      ]);

      // Calculate admin statistics
      const totalStocks = stocksResp.data?.length || 0;
      const totalUsers = topUsersResp.data?.length || 0;
      const totalTrades = topUsersResp.data?.reduce((sum, user) => sum + (user.totalTrades || 0), 0);
      const totalVolume = stockReportResp.data?.reduce((sum, stock) => sum + (stock.volume || 0), 0);

      setAdminData({
        totalUsers,
        totalStocks,
        totalTrades,
        totalVolume
      });

      setUserStats(topUsersResp.data?.slice(0, 5) || []);
      setStockStats(topStocksResp.data?.slice(0, 5) || []);

      // Generate sample recent trades for admin view
      const sampleTrades = [
        { id: 1, user: 'user1', stock: 'AAPL', type: 'buy', quantity: 10, price: 150.25, time: new Date() },
        { id: 2, user: 'user2', stock: 'GOOGL', type: 'sell', quantity: 5, price: 2750.50, time: new Date() },
        { id: 3, user: 'user3', stock: 'MSFT', type: 'buy', quantity: 15, price: 330.75, time: new Date() },
      ];
      setRecentTrades(sampleTrades);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'blue', change }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {change && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-800 text-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-purple-100">System overview and management controls</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={adminData.totalUsers}
          icon="👥"
          color="blue"
          change={5.2}
        />
        <StatCard
          title="Active Stocks"
          value={adminData.totalStocks}
          icon="📈"
          color="green"
          change={2.1}
        />
        <StatCard
          title="Total Trades"
          value={adminData.totalTrades}
          icon="🔄"
          color="purple"
          change={8.7}
        />
        <StatCard
          title="Trading Volume"
          value={formatCurrency(adminData.totalVolume)}
          icon="💰"
          color="yellow"
          change={-3.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Performance Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top User Performance</h3>
          {userStats.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="userId" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Profit/Loss']}
                  />
                  <Bar dataKey="profitLoss" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No user data available</p>
          )}
        </div>

        {/* Stock Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Stock Distribution</h3>
          {stockStats.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="currentPrice"
                  >
                    {stockStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No stock data available</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trades */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Recent Trades</h3>
          </div>
          <div className="p-6">
            {recentTrades.length > 0 ? (
              <div className="space-y-3">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{trade.user}</p>
                      <p className="text-sm text-gray-500">
                        {trade.type.toUpperCase()} {trade.quantity} {trade.stock}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(trade.price * trade.quantity)}
                      </p>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        trade.type === 'buy' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent trades</p>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">System Status</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Trading System</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-green-600 text-sm">Online</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Database</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-green-600 text-sm">Connected</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Price Updates</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-600 text-sm">Running</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-700">API Status</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-green-600 text-sm">Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Admin Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <span className="text-2xl mb-2 block">👥</span>
              <p className="text-sm font-medium text-blue-700">Manage Users</p>
            </div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <span className="text-2xl mb-2 block">📈</span>
              <p className="text-sm font-medium text-green-700">Stock Control</p>
            </div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <span className="text-2xl mb-2 block">⚙️</span>
              <p className="text-sm font-medium text-purple-700">System Settings</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
