import { useAuthStore } from '@/stores/auth-store';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const user = useAuthStore((state) => state.user);

  const isAdmin = user?.roles?.includes('ADMIN');

  if (!isAdmin) {
    // Không phải ADMIN → redirect về trang chủ
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
