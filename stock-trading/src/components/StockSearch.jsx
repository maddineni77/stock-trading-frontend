import React, { useState, useEffect } from 'react';
import { realTimeStockAPI } from '../services/api';

const StockSearch = ({ onSearch, className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.length > 1) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const performSearch = async (keywords) => {
    try {
      setIsSearching(true);
      const response = await realTimeStockAPI.searchStocks(keywords);
      if (response.success) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Stock search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder="Search stocks (e.g., AAPL, Tesla)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      
      {isSearching && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((stock, index) => (
            <button
              key={index}
              onClick={() => {
                onSearch(stock.symbol);
                setSearchTerm('');
                setSearchResults([]);
              }}
              className="w-full text-left p-3 hover:bg-gray-100 border-b last:border-b-0"
            >
              <div className="font-semibold">{stock.symbol}</div>
              <div className="text-sm text-gray-600">{stock.name}</div>
              <div className="text-xs text-gray-500">{stock.type} • {stock.region}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockSearch;
