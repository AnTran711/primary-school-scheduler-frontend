import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/layouts/main-layout';
import TeacherPage from '@/pages/teacher-page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        path: '/teachers',
        element: <TeacherPage />
      }
    ]
  }
]);

export default router;
