import { useEffect, useState, useRef, useMemo } from 'react';
import { transactionAPI } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/helpers';

const TransactionFeed = () => {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('all'); // all | buy | sell
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const pollingRef = useRef(null);

  const getCurrentUserId = () => {
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      return user?._id || user?.userId || user?.id || null;
    } catch {
      return null;
    }
  };

  const fetchTransactions = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setTransactions([]);
      return;
    }
    try {
      const resp = await transactionAPI.getUserTransactions(userId);
      const list = resp?.data || resp || [];
      setTransactions(Array.isArray(list) ? list.slice(-20).reverse() : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(fetchTransactions, 7000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(0);
  }, [filterType, startDate, endDate, pageSize]);

  const filtered = useMemo(() => {
    let list = Array.isArray(transactions) ? transactions : [];
    if (filterType !== 'all') {
      list = list.filter(t => (t.type || '').toLowerCase() === filterType);
    }
    if (startDate) {
      const sd = new Date(startDate).getTime();
      list = list.filter(t => new Date(t.date || t.timestamp || Date.now()).getTime() >= sd);
    }
    if (endDate) {
      const ed = new Date(endDate).getTime();
      list = list.filter(t => new Date(t.date || t.timestamp || Date.now()).getTime() <= ed);
    }
    return list;
  }, [transactions, filterType, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = useMemo(() => {
    const start = currentPage * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const getBadge = (type) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
      type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {type}
    </span>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <div className="flex items-center gap-2 text-xs text-gray-700">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              <option value="all">All</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 border rounded"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 border rounded"
            />
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value))}
              className="px-2 py-1 border rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <button onClick={fetchTransactions} className="px-2 py-1 border rounded">Refresh</button>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No recent transactions</p>
        ) : (
          paged.map((t, idx) => (
            <div key={idx} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  {getBadge(t.type)}
                  <span className="font-medium text-gray-900">{t.stockSymbol || t.symbol}</span>
                </div>
                <p className="text-xs text-gray-500">{formatDateTime(t.date || t.timestamp || new Date())}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-900">{t.quantity} @ {formatCurrency(t.price)}</p>
                <p className="text-xs text-gray-500">Total {formatCurrency((t.quantity || 0) * (t.price || 0))}</p>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="px-6 py-3 flex items-center justify-between text-sm text-gray-700">
          <span>
            Page {currentPage + 1} of {totalPages} • {filtered.length} items
          </span>
          <div className="space-x-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={currentPage === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFeed;


