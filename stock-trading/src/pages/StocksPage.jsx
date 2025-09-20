import { useState,useEffect, useRef } from 'react';
import { createWebSocketConnection } from '../services/api';
import StockRegistration from '../components/StockRegistration';
import StockHistory from '../components/StockHistory';
import {  realTimeStockAPI } from '../services/api';
import StockSearch from '../components/StockSearch';
const StocksPage = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [realTimeData, setRealTimeData] = useState({});
const [symbols, setSymbols] = useState(() => {
  try {
    const raw = localStorage.getItem('watchlistSymbols');
    const list = raw ? JSON.parse(raw) : null;
    return Array.isArray(list) && list.length ? list : ['AAPL', 'GOOGL', 'MSFT'];
  } catch {
    return ['AAPL', 'GOOGL', 'MSFT'];
  }
}); // Watchlist symbols
const pollingRef = useRef(null);
const wsRef = useRef(null);
const fetchRealTimeData = async (symbolsList) => {
  try {
    const response = await realTimeStockAPI.getMultipleRealTimeQuotes(symbolsList);
    
    if (!response?.success || !response?.data) {
      throw new Error('Invalid API response structure');
    }

    const dataMap = {};
    
    // Handle both array and object responses
    if (Array.isArray(response.data)) {
      response.data.forEach(stock => {
        dataMap[stock.symbol] = stock;
      });
    } else if (typeof response.data === 'object') {
      // If data is an object with symbol keys
      Object.entries(response.data).forEach(([symbol, stockData]) => {
        dataMap[symbol] = stockData;
      });
    }
    
    setRealTimeData(dataMap);
  } catch (error) {
    console.error('Failed to fetch real-time data:', error);
    setRealTimeData({}); // Reset to empty object on error
  }
};


const handleSearch = (keyword) => {
  if (keyword) {
    const next = [keyword.toUpperCase(), ...symbols.filter(s => s !== keyword.toUpperCase())].slice(0, 10);
    setSymbols(next);
  }
};

useEffect(() => {
  // initial fetch
  fetchRealTimeData(symbols);
  // start polling every 5 seconds
  if (pollingRef.current) clearInterval(pollingRef.current);
  pollingRef.current = setInterval(() => {
    fetchRealTimeData(symbols);
  }, 5000);
  // persist watchlist
  try { localStorage.setItem('watchlistSymbols', JSON.stringify(symbols)); } catch {}
  return () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
  };
}, [symbols]);

// Attempt WebSocket live updates with graceful fallback to polling
useEffect(() => {
  if (wsRef.current) {
    try { wsRef.current.close(); } catch {}
    wsRef.current = null;
  }
  try {
    wsRef.current = createWebSocketConnection((payload) => {
      // payload expected: { symbol, price, change, changePercent }
      if (!payload || !payload.symbol) return;
      setRealTimeData(prev => ({ ...prev, [payload.symbol]: payload }));
    });
  } catch {
    // ignore, polling will continue
  }
  return () => {
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
    }
  };
}, []);


  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stock History & Prices
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'register'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Register New Stock
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'history' && (
  <div>
    <div className="mb-4">
      <h2 className="text-xl font-semibold">Stock Price History</h2>
      <p className="text-gray-600">View real-time stock prices and historical data</p>
    </div>

    {/* 🔍 Stock Search */}
    <StockSearch onSearch={handleSearch} />

    {/* 📈 Real-time Data Display */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {Object.keys(realTimeData).length === 0 ? (
        <p className="text-gray-500">No real-time data available</p>
      ) : (
        Object.values(realTimeData).map((stock) => (
          <div key={stock.symbol} className="bg-white border p-4 rounded shadow">
            <h3 className="text-lg font-bold">{stock.symbol}</h3>
            <p>Price: ${stock.price}</p>
            <p>Change: {stock.change} ({stock.changePercent}%)</p>
          </div>
        ))
      )}
    </div>

    {/* 📜 Historical Data Component */}
    <div className="mt-6">
      <StockHistory />
    </div>
  </div>
)}


          {activeTab === 'register' && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Register New Stock</h2>
                <p className="text-gray-600">Add a new stock to the trading system</p>
              </div>
              <StockRegistration />
            </div>
          )}
        </div>
      </div>
    </div>
    
  );
};

export default StocksPage;
