import { useState } from 'react';
import { stockAPI } from '../services/api';
import { showToast } from '../utils/helpers';

const StockRegistration = () => {
  const [stock, setStock] = useState({ symbol: '', name: '', quantity: '', price: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStock((prevState) => ({ ...prevState, [name]: value }));
  };

  const registerStock = async () => {
    try {
      await stockAPI.registerStock(stock);
      showToast('Stock registered successfully!', 'success');
      setStock({ symbol: '', name: '', quantity: '', price: '' });
    } catch (error) {
      showToast(`Error: ${error}`, 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerStock();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="text"
          name="symbol"
          value={stock.symbol}
          onChange={handleChange}
          placeholder="Symbol"
          className="w-1/5 px-3 py-2 border border-gray-300 rounded"
          required
        />
        <input
          type="text"
          name="name"
          value={stock.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-1/3 px-3 py-2 border border-gray-300 rounded"
          required
        />
        <input
          type="number"
          name="quantity"
          value={stock.quantity}
          onChange={handleChange}
          placeholder="Quantity"
          className="w-1/5 px-3 py-2 border border-gray-300 rounded"
          required
        />
        <input
          type="number"
          name="price"
          value={stock.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-1/5 px-3 py-2 border border-gray-300 rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
      >
        Register Stock
      </button>
    </form>
  );
};

export default StockRegistration;
