import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/helpers';
import { userAPI } from '../services/api';

const Login = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('user');
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    userType: 'user'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value,
      userType: activeTab
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call login API using the API service
      const userData = await userAPI.loginUser({
        email: loginData.email,
        password: loginData.password
      });
      const user =userData.user
      const token=userData.token
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('userType', user.userType || loginData.userType);
      
      showToast(`Welcome back, ${user.username || user.name || user.email}!`, 'success');
      
      // Call onLogin callback to update app state
      onLogin(user);
      
      // Redirect based on user type
      if (user.userType === 'admin' || loginData.userType === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch {
      // For demo purposes, allow demo login
      if (loginData.email === 'demo@user.com' && loginData.password === 'demo123') {
        const demoUser = {
          id: 'user1',
          name: 'Demo User',
          email: 'demo@user.com',
          userType: 'user',
          token: 'demo-token-user'
        };
        
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('token', demoUser.token);
        localStorage.setItem('userType', demoUser.userType);
        
        showToast('Welcome Demo User!', 'success');
        onLogin(demoUser);
        navigate('/');
      } else if (loginData.email === 'admin@stock.com' && loginData.password === 'admin123') {
        const demoAdmin = {
          id: 'admin1',
          name: 'Demo Admin',
          email: 'admin@stock.com',
          userType: 'admin',
          token: 'demo-token-admin'
        };
        
        localStorage.setItem('user', JSON.stringify(demoAdmin));
        localStorage.setItem('token', demoAdmin.token);
        localStorage.setItem('userType', demoAdmin.userType);
        
        showToast('Welcome Demo Admin!', 'success');
        onLogin(demoAdmin);
        navigate('/admin/dashboard');
      } else {
        showToast('Login failed. Try demo credentials.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center bg-blue-100 rounded-full">
            <span className="text-2xl">📈</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Stock Trading System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('user')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'user'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👤 User Login
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'admin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔑 Admin Login
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={loginData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={loginData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                `Sign in as ${activeTab === 'user' ? 'User' : 'Admin'}`
              )}
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-600">Don't have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up here
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>User:</strong> demo@user.com / demo123</p>
              <p><strong>Admin:</strong> admin@stock.com / admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
