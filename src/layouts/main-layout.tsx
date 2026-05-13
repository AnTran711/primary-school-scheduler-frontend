import { Outlet } from 'react-router-dom';
import LeftSidebar from '@/components/layout/left-sidebar';
import { fetchTeachersAPI } from '@/api/teacher.api';
import { useEffect, useState } from 'react';
import { fetchBranchSchoolsAPI } from '@/api/branch-school.api';
import { toast } from 'react-toastify';
import { Box, CircularProgress, Typography } from '@mui/material';
import { fetchSchoolClassesAPI } from '@/api/school-class.api';
import { fetchSubjectsAPI } from '@/api/subject.api';

const MainLayout = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        await Promise.all([
          fetchTeachersAPI(),
          fetchBranchSchoolsAPI(),
          fetchSchoolClassesAPI(),
          fetchSubjectsAPI()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: 'text.primary' }}
        >
          Đang tải dữ liệu...
        </Typography>
      </Box>
    );
  }

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
