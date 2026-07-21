import { useEffect } from 'react';
import { useAuthStore, isTokenExpired } from '@/stores/auth-store';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuthenticated, token, logout } = useAuthStore();

  useEffect(() => {
    // Kiểm tra token hết hạn khi component mount (mở app lại)
    if (isAuthenticated && isTokenExpired(token)) {
      logout();
    }
  }, [isAuthenticated, token, logout]);

  // Nếu chưa login hoặc token hết hạn → redirect về /login
  if (!isAuthenticated || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
