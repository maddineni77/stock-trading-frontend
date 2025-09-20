import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { formatCurrency, showToast } from '../utils/helpers';

const LoanManagement = () => {
  const [loanForm, setLoanForm] = useState({
    userId: 'user1', // Default user ID
    amount: ''
  });
  const [userBalance, setUserBalance] = useState(0);
  const [userLoans, setUserLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  const MAX_LOAN_AMOUNT = 100000; // As per requirements

  useEffect(() => {
    fetchUserData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserData = async () => {
    try {
      const balanceResponse = await userAPI.getUserBalance(loanForm.userId);
      setUserBalance(balanceResponse.balance || 0);
      
      // You might want to create an API endpoint to get user loans
      // For now, we'll use a placeholder
      setUserLoans([]); // Placeholder for loan history
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loanAmount = parseFloat(loanForm.amount);

    // Validation
    if (loanAmount <= 0) {
      showToast('Loan amount must be greater than 0', 'error');
      setLoading(false);
      return;
    }

    if (loanAmount > MAX_LOAN_AMOUNT) {
      showToast(`Loan amount cannot exceed ${formatCurrency(MAX_LOAN_AMOUNT)}`, 'error');
      setLoading(false);
      return;
    }

    try {
      await userAPI.takeLoan(loanForm.userId, loanAmount);
      showToast('Loan approved successfully!', 'success');
      setLoanForm({ ...loanForm, amount: '' });
      fetchUserData(); // Refresh user data
    } catch (error) {
      showToast(`Error processing loan: ${error.message || error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateLoanEligibility = () => {
    // Simple eligibility calculation - you can make this more complex
    // based on your business rules
    const eligibleAmount = Math.max(0, MAX_LOAN_AMOUNT - userBalance);
    return eligibleAmount;
  };

  const isEligibleForLoan = () => {
    return calculateLoanEligibility() > 0;
  };

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Balance</h3>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(userBalance)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Available funds</p>
            <button
              onClick={fetchUserData}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Loan Eligibility */}
      <div className={`p-6 rounded-lg shadow ${isEligibleForLoan() ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 ${isEligibleForLoan() ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <div>
            <h4 className={`font-medium ${isEligibleForLoan() ? 'text-green-800' : 'text-red-800'}`}>
              Loan Eligibility Status
            </h4>
            <p className={`text-sm ${isEligibleForLoan() ? 'text-green-600' : 'text-red-600'}`}>
              {isEligibleForLoan() 
                ? `You are eligible for up to ${formatCurrency(calculateLoanEligibility())} loan`
                : 'You are not eligible for additional loans at this time'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Loan Application Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Apply for Loan</h3>
          <p className="text-sm text-gray-500 mt-1">
            Maximum loan amount: {formatCurrency(MAX_LOAN_AMOUNT)}
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleLoanSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={MAX_LOAN_AMOUNT}
                  value={loanForm.amount}
                  onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter loan amount"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter amount between $0.01 and {formatCurrency(MAX_LOAN_AMOUNT)}
              </p>
            </div>

            {/* Loan Terms */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Loan Terms & Conditions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Maximum loan amount: {formatCurrency(MAX_LOAN_AMOUNT)}</li>
                <li>• Funds will be added to your trading balance immediately</li>
                <li>• Loans must be repaid through successful trading</li>
                <li>• Trading stops when loan balance is exhausted</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading || !isEligibleForLoan() || !loanForm.amount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Apply for Loan'}
              </button>
              
              <button
                type="button"
                onClick={() => setLoanForm({ ...loanForm, amount: calculateLoanEligibility().toString() })}
                disabled={!isEligibleForLoan()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Max Amount
              </button>
            </div>

            {!isEligibleForLoan() && (
              <p className="text-red-600 text-sm">
                You have reached your maximum loan limit. Please repay existing loans to apply for more.
              </p>
            )}

            {parseFloat(loanForm.amount) > calculateLoanEligibility() && loanForm.amount && (
              <p className="text-red-600 text-sm">
                Loan amount exceeds your eligibility limit of {formatCurrency(calculateLoanEligibility())}.
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Loan Calculator */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Loan Impact Calculator</h3>
        </div>
        
        <div className="p-6">
          {loanForm.amount && parseFloat(loanForm.amount) > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Requested Amount</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(parseFloat(loanForm.amount))}
                </p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">New Total Balance</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(userBalance + parseFloat(loanForm.amount))}
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Remaining Loan Capacity</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(Math.max(0, calculateLoanEligibility() - parseFloat(loanForm.amount)))}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loan History - Placeholder for future implementation */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Loan History</h3>
        </div>
        
        <div className="p-6">
          {userLoans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userLoans.map((loan, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {loan.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(loan.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No loan history found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanManagement;
