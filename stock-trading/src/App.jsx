import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StocksPage from './pages/StocksPage';
import Trading from './components/Trading';
import PortfolioPage from './pages/PortfolioPage';
import Reports from './components/Reports';
import LoanManagement from './components/LoanManagement';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AIAssistant from './components/AiAssistant';
function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const userData = localStorage.getItem('user');
    if (userData) {
      // User data exists, no need to set state since not used
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    // Login handled, no state update needed
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected User Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/stocks" element={
          <ProtectedRoute>
            <Layout>
              <StocksPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/trading" element={
          <ProtectedRoute>
            <Layout>
              <Trading />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/portfolio" element={
          <ProtectedRoute>
            <Layout>
              <PortfolioPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/loan" element={
          <ProtectedRoute>
            <Layout>
              <LoanManagement />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AIAssistant/>
    </Router>
  );
}

export default App;
