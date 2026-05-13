import { Outlet } from 'react-router-dom';
import LeftSidebar from '@/components/layout/left-sidebar';
import { fetchTeachersAPI } from '@/api/teacher.api';
import { useEffect } from 'react';

const MainLayout = () => {
  useEffect(() => {
    fetchTeachersAPI();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      <LeftSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
