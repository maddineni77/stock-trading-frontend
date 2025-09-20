import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { stockAPI, userAPI } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import {calculatePortfolioValueFromStocks} from '../utils/helpers'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    balance: 0,
    portfolioValue: 0,
    totalProfitLoss: 0,
    totalTrades: 0
  });
  const [recentStocks, setRecentStocks] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
  setLoading(true);
  
  try {
    // Validate user data (support multiple shapes and avoid throwing)
    const storedUser = localStorage.getItem('user');
    let user = null;
    try {
      user = storedUser ? JSON.parse(storedUser) : null;
    } catch (_) {
      user = null;
    }

    const userId = user?._id || user?.id;
    const displayName = user?.username || user?.email || user?.name || '';
    if (!userId) {
      setError('Please login to continue');
      localStorage.removeItem('user');
      navigate('/login');
      return;
    }

    // Make API requests with error handling for each
    const [balanceResp, reportResp, stocksResp] = await Promise.all([
      userAPI.getUserBalance(userId).catch(e => ({ 
        error: e.message || 'Failed to fetch balance',
        success: false 
      })),
      userAPI.getUserReport(userId).catch(e => ({
        error: e.message || 'Failed to fetch report', 
        success: false
      })),
      stockAPI.getAllStocks().catch(e => ({
        error: e.message || 'Failed to fetch stocks',
        data: []
      }))
    ]);

    // Log responses for debugging
    console.log('API Responses:', { balanceResp, reportResp, stocksResp });

    // Validate critical responses
    if (!balanceResp?.success) {
      throw new Error(balanceResp?.error || 'Failed to load balance data');
    }
    if (!reportResp?.success) {
      throw new Error(reportResp?.error || 'Failed to load report data');
    }

    // Process data with fallbacks
    const safeStocks = stocksResp?.data || stocksResp || [];
    const safeRecentTrades = reportResp?.data?.recentTrades || reportResp?.recentTrades || [];
    
    // Update state with proper null checks
    setDashboardData({
      balance: balanceResp.balance || 0,
      portfolioValue: calculatePortfolioValueFromStocks(safeStocks), // Calculate from stocks array
      totalProfitLoss: reportResp?.totalProfitLoss || 0,
      totalTrades: reportResp?.totalTrades || 0
    });

    setRecentStocks(safeStocks.slice(0, 5));
    setRecentTrades(safeRecentTrades.slice(0, 5));
    
    // Only generate sample data if real data isn't available
    setMarketData(reportResp?.marketData || generateSampleMarketData());

  } catch (error) {
    console.error('Dashboard error:', error);
    
    // Handle specific error cases
    if (error.message.toLowerCase().includes('authenticated') || 
        error.message.toLowerCase().includes('unauthorized')) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  } finally {
    setLoading(false);
  }
};
  const generateSampleMarketData = () => {
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        value: 50 + Math.random() * 50 // Random value between 50-100
      });
    }
    return data;
  };

  const StatCard = ({ title, value, change, icon, color = 'blue' }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {change && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
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
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2">Welcome to Stock Trading Dashboard</h1>
        <p className="text-blue-100">Monitor your trading performance and market trends in real-time</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Account Balance"
          value={formatCurrency(dashboardData.balance)}
          icon="💰"
          color="green"
        />
        <StatCard
          title="Portfolio Value"
          value={formatCurrency(dashboardData.portfolioValue)}
          icon="💼"
          color="blue"
        />
        <StatCard
          title="Total P&L"
          value={formatCurrency(dashboardData.totalProfitLoss)}
          icon="📈"
          color={dashboardData.totalProfitLoss >= 0 ? "green" : "red"}
        />
        <StatCard
          title="Total Trades"
          value={dashboardData.totalTrades.toString()}
          icon="🔄"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Overview Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Market Overview (24h)</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Market Index']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
              <div className="text-center">
                <span className="text-2xl mb-2 block">📊</span>
                <p className="text-sm font-medium text-green-700">Buy Stocks</p>
              </div>
            </button>
            
            <button className="p-4 border-2 border-dashed border-red-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors">
              <div className="text-center">
                <span className="text-2xl mb-2 block">💸</span>
                <p className="text-sm font-medium text-red-700">Sell Stocks</p>
              </div>
            </button>
            
            <button className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <div className="text-center">
                <span className="text-2xl mb-2 block">🏦</span>
                <p className="text-sm font-medium text-blue-700">Take Loan</p>
              </div>
            </button>
            
            <button className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
              <div className="text-center">
                <span className="text-2xl mb-2 block">📋</span>
                <p className="text-sm font-medium text-purple-700">View Reports</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stock Prices */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Market Stocks</h3>
          </div>
          <div className="p-6">
            {recentStocks.length > 0 ? (
              <div className="space-y-3">
                {recentStocks.map((stock, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{stock.symbol}</p>
                      <p className="text-sm text-gray-500">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(stock.currentPrice || stock.price)}
                      </p>
                      <p className="text-sm text-green-600">Available</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No stocks available</p>
            )}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Recent Trades</h3>
          </div>
          <div className="p-6">
            {recentTrades.length > 0 ? (
              <div className="space-y-3">
                {recentTrades.map((trade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{trade.stockSymbol}</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(trade.date)} • {trade.quantity} shares
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(trade.price)}
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
      </div>

      {/* Performance Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(dashboardData.balance + dashboardData.portfolioValue)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Assets</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">+5.2%</p>
            <p className="text-sm text-gray-600 mt-1">Today's Change</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{dashboardData.totalTrades}</p>
            <p className="text-sm text-gray-600 mt-1">Total Trades</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
