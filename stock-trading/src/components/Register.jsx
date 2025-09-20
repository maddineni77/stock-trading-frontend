import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/helpers';
import { userAPI } from '../services/api';

const Register = () => {
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('user');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value,
      userType: activeTab
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  // Password confirmation check
  if (registerData.password !== registerData.confirmPassword) {
    showToast('Passwords do not match', 'error');
    setLoading(false);
    return;
  }

  try {
    const userData = {
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
      userType: activeTab // Include userType in the registration
    };

    const response = await userAPI.registerUser(userData);
    
    // Handle successful registration
    if (response.token) {
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        _id: response.user._id,
        username: response.user.username,
        email: response.user.email,
        userType: activeTab
      }));
      
      showToast('Registration successful! You are now logged in.', 'success');
      navigate('/dashboard');
    } else {
      showToast('Registration successful. Please log in.', 'success');
      navigate('/login');
    }
  } catch (error) {
    console.error('Registration error', error);
    
    // Enhanced error handling
    let errorMessage = 'Registration failed';
    if (error?.response) {
      // Handle backend validation errors
      errorMessage = error.response.data?.message || errorMessage;
      
      // Specific handling for duplicate user
      if (error.response.status === 400 && 
          errorMessage.includes('already exists')) {
        errorMessage = 'Username or email already in use';
      }
    } else if (error?.request) {
      // The request was made but no response was received
      errorMessage = 'Cannot connect to server';
    }
    
    showToast(errorMessage, 'error');
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
            Create your account
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
              👤 User Registration
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'admin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔑 Admin Registration
            </button>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={registerData.username}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={registerData.email}
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
                value={registerData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={registerData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing up...' : `Sign up as ${activeTab === 'user' ? 'User' : 'Admin'}`}
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

