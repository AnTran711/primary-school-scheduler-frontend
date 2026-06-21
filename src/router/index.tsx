import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/main-layout';
import TeacherPage from '@/pages/teacher-page';
import LoginPage from '@/pages/login-page';
import ProtectedRoute from '@/components/protected-route';
import AdminRoute from '@/components/admin-route';
import BranchSchoolPage from '@/pages/branch-school-page';
import SubjectPage from '@/pages/subject-page';
import SchoolClassPage from '@/pages/school-class-page';
import ClassSubjectPage from '@/pages/class-subject-page';
import LessonPage from '@/pages/lesson-page';
import TimetablePage from '@/pages/timetable-page';
import ChangePasswordPage from '@/pages/change-password-page';
import UserManagementPage from '@/pages/user-management-page';
import NotFoundPage from '@/pages/not-found-page';

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
            element: <Navigate to="/timetable" replace />
          },
          {
            path: '/timetable',
            element: <TimetablePage />
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
          },
          {
            path: '/classes',
            element: <SchoolClassPage />
          },
          {
            path: '/class-subjects',
            element: <ClassSubjectPage />
          },
          {
            path: '/teaching-assignments',
            element: <LessonPage />
          },
          {
            path: '/change-password',
            element: <ChangePasswordPage />
          },

          // ── Admin only routes ─────────────────────────────────────────────
          {
            element: <AdminRoute />,
            children: [
              {
                path: '/users',
                element: <UserManagementPage />
              }
            ]
          }
        ]
      }
    ]
  },

  // ── 404 Catch-all ──────────────────────────────────────────────────────────
  {
    path: '*',
    element: <NotFoundPage />
  }
]);

export default router;
