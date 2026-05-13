import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/main-layout';
import TeacherPage from '@/pages/teacher-page';
import LoginPage from '@/pages/login-page';
import ProtectedRoute from '@/components/protected-route';
import BranchSchoolPage from '@/pages/branch-school-page';
import SubjectPage from '@/pages/subject-page';

const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────────
  {
    path: '/login',
    element: <LoginPage />
  },

  // ── Protected routes ───────────────────────────────────────────────────────
  {
    element: <ProtectedRoute />, // Kiểm tra auth trước
    children: [
      {
        element: <MainLayout />, // Sau đó render layout
        children: [
          {
            index: true,
            path: '/',
            element: <Navigate to="/teachers" replace />
          },
          {
            path: '/teachers',
            element: <TeacherPage />
          },
          {
            path: '/branch-schools',
            element: <BranchSchoolPage />
          },
          {
            path: '/subjects',
            element: <SubjectPage />
          }
          // Thêm các route khác vào đây
          // { path: '/classes',  element: <ClassPage />   },
        ]
      }
    ]
  }
]);

export default router;
