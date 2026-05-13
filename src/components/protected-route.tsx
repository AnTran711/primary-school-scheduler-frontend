import { useAuthStore } from '@/stores/auth-store';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // Chưa login → redirect về /login
    return <Navigate to="/login" replace />;
  }

  // Đã login → render trang được yêu cầu
  return <Outlet />;
};

export default ProtectedRoute;
