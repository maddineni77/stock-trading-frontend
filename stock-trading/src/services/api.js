import axios from 'axios';

const API_BASE_URL = 'https://stock-trading-tau.vercel.app/api/'; // Updated to match your backend port

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for CORS
  timeout: 10000, // 10 second timeout
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      // Redirect to login if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Stock Management APIs
export const stockAPI = {
  // Register a new stock
  registerStock: async (stockData) => {
    try {
      const response = await api.post('/stocks/register', stockData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get stock price history
  getStockHistory: async (stockSymbol) => {
    try {
      const response = await api.get(`/stocks/history${stockSymbol ? `?symbol=${stockSymbol}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all stocks
  getAllStocks: async () => {
    try {
      const response = await api.get('/stocks');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get stock report
  getStockReport: async () => {
    try {
      const response = await api.get('/stocks/report');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top performing stocks
  getTopStocks: async () => {
    try {
      const response = await api.get('/stocks/top');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// User Management APIs
export const userAPI = {
  // Register user
  registerUser: async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      // Store token in localStorage if registration returns a token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login user
  loginUser: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      // Store token in localStorage if login is successful
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Set default authorization header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout user
  logoutUser: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  },

  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user report
  getUserReport: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/report`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch report' };
    }
  },

  // Get top performing users
  getTopUsers: async () => {
    try {
      const response = await api.get('/users/top');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user portfolio
  getUserPortfolio: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/portfolio`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user balance
  getUserBalance: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/balance`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch balance' };
    }}
};

// Loan Management APIs
export const loanAPI = {
  // Take a loan
  takeLoan: async (loanData) => {
    try {
      const response = await api.post('/loan/take', loanData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Repay loan
  repayLoan: async (repayData) => {
    try {
      const response = await api.post('/loan/repay', repayData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get loan status
  getLoanStatus: async (userId) => {
    try {
      const response = await api.get(`/loan/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Transaction APIs
export const transactionAPI = {
  // Buy stocks
  buyStock: async (buyData) => {
    try {
      const response = await api.post('/txn/buy', buyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Sell stocks
  sellStock: async (sellData) => {
    try {
      const response = await api.post('/txn/sell', sellData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user transactions
  getUserTransactions: async (userId) => {
    try {
      const response = await api.get(`/txn/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Price APIs
export const priceAPI = {
  // Get current prices
  getCurrentPrices: async () => {
    try {
      const response = await api.get('/price');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// WebSocket connection for real-time updates
export const createWebSocketConnection = (onStockUpdate) => {
  const ws = new WebSocket('ws://localhost:3000'); // Adjust to your WebSocket URL
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'stockUpdate') {
        onStockUpdate(data.payload);
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return ws;
};
// AI Chat APIs
export const aiAPI = {
  sendAIMessage: async (message) => {
    try {
      const response = await api.post('/ai/chat', { message });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  analyzePortfolio: async () => {
    try {
      const response = await api.post('/ai/analyze-portfolio');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Real-Time Stock APIs
export const realTimeStockAPI = {
  getRealTimeQuote: async (symbol) => {
    try {
      const response = await api.get(`/stocks/realtime/${symbol}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMultipleRealTimeQuotes: async (symbols) => {
    try {
      const response = await api.post('/stocks/realtime/multiple', { symbols });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  searchStocks: async (keywords) => {
    try {
      const response = await api.get(`/stocks/search/${keywords}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};


export default api;
