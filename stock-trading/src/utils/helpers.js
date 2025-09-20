// Currency formatting
export const formatCurrency = (amount) => {
  // Handle null/undefined/empty string
  if (amount === null || amount === undefined || amount === '') return '$0.00';
  
  // Convert string numbers to numbers
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle NaN cases
  if (isNaN(num)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};
// Number formatting with commas
export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

// Percentage formatting
export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(2)}%`;
};

// Date formatting
export const formatShortDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};

// Date and time formatting
export const formatDateTime = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};
export const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds/60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds/3600)}h ago`;
  return formatShortDate(dateString);
};
// Calculate profit/loss
export const calculateProfitLoss = (buyPrice, currentPrice, quantity) => {
  return (currentPrice - buyPrice) * quantity;
};
// Calculate total portfolio value
export const calculatePortfolioValue = (holdings, stocks) => {
  if (!holdings || !stocks) return 0;
  
  return holdings.reduce((total, holding) => {
    const stock = stocks.find(s => s.symbol === holding.stockSymbol);
    const currentPrice = stock?.currentPrice || stock?.price || 0;
    return total + (holding.quantity * currentPrice);
  }, 0);
};

// Calculate portfolio value from stocks array (for dashboard)
export const calculatePortfolioValueFromStocks = (stocks) => {
  if (!stocks || !Array.isArray(stocks)) return 0;
  
  return stocks.reduce((total, stock) => {
    const currentPrice = stock?.currentPrice || stock?.price || 0;
    const quantity = stock?.quantity || 0;
    return total + (quantity * currentPrice);
  }, 0);
};

// Calculate profit/loss percentage
export const calculateProfitLossPercentage = (buyPrice, currentPrice) => {
  return ((currentPrice - buyPrice) / buyPrice) * 100;
};

// Validate stock symbol
export const isValidStockSymbol = (symbol) => {
  return /^[A-Z]{1,5}$/.test(symbol.toUpperCase());
};

// Validate positive number
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

// Generate random stock price (for simulation)
export const generateRandomPrice = (currentPrice, volatility = 0.05) => {
  const change = (Math.random() - 0.5) * 2 * volatility;
  const newPrice = currentPrice * (1 + change);
  return Math.max(1, Math.min(100, newPrice)); // Keep price between 1 and 100
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Local storage helpers
export const localStorage = {
  get: (key) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// Toast notifications (you can replace with a proper toast library)
export const showToast = (message, type = 'info') => {
  // Simple console logging for now - you can integrate with react-toastify or similar
  console.log(`${type.toUpperCase()}: ${message}`);
  
  // You can implement actual toast notifications here
  alert(`${type.toUpperCase()}: ${message}`);
};

// Stock color coding based on performance
export const getStockColor = (profitLoss) => {
  if (profitLoss > 0) return 'text-green-600';
  if (profitLoss < 0) return 'text-red-600';
  return 'text-gray-600';
};

// Trading status colors
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'success':
      return 'text-green-600 bg-green-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'failed':
    case 'error':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};
