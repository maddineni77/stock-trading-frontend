import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const userType = localStorage.getItem('userType');

      if (token && user) {
        const userData = JSON.parse(user);
        setIsAuthenticated(true);
        setUserRole(userType || userData.userType);
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required and user doesn't have it
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = userRole === 'admin' ? '/admin/dashboard' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and has required role (if any)
  return children;
};

export default ProtectedRoute;
