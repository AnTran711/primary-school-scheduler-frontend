import { NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarMonth,
  People,
  AccountBalance,
  Class,
  MenuBook,
  LogoutOutlined,
  AssignmentOutlined,
  AssignmentInd
} from '@mui/icons-material';
import { Avatar, IconButton, Tooltip } from '@mui/material';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/api/auth.api';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

// ─── Nav Config ────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Thời khóa biểu',
    icon: <CalendarMonth fontSize="small" />,
    path: '/timetable'
  },
  { label: 'Giáo viên', icon: <People fontSize="small" />, path: '/teachers' },
  {
    label: 'Điểm trường',
    icon: <AccountBalance fontSize="small" />,
    path: '/branch-schools'
  },
  { label: 'Lớp học', icon: <Class fontSize="small" />, path: '/classes' },
  { label: 'Môn học', icon: <MenuBook fontSize="small" />, path: '/subjects' },
  {
    label: 'Phân môn theo lớp',
    icon: <AssignmentOutlined fontSize="small" />,
    path: '/class-subjects'
  },
  {
    label: 'Phân công giảng dạy',
    icon: <AssignmentInd fontSize="small" />,
    path: '/teaching-assignments'
  }
];

// ─── SidebarNavItem ────────────────────────────────────────────────────────────

const SidebarNavItem = ({ item }: { item: NavItem }) => (
  <NavLink
    to={item.path}
    className={({ isActive }) =>
      [
        'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-white/10 text-white'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      ].join(' ')
    }
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-teal-400" />
        )}
        <span className={isActive ? 'text-teal-400' : ''}>{item.icon}</span>
        <span>{item.label}</span>
      </>
    )}
  </NavLink>
);

// ─── UserSection ───────────────────────────────────────────────────────────────

const UserSection = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    const token = useAuthStore.getState().token;
    authApi.logout({ token: token ?? '' });

    logout();
    navigate('/login', { replace: true });
  };

  const avatarLetter = user?.username?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="flex items-center gap-2 px-3 py-3">
      {/* Avatar */}
      <Avatar
        sx={{
          width: 32,
          height: 32,
          fontSize: '0.8125rem',
          fontWeight: 600,
          bgcolor: 'rgba(45,212,191,0.15)',
          color: '#2dd4bf',
          flexShrink: 0
        }}
      >
        {avatarLetter}
      </Avatar>

      {/* Username */}
      <span className="flex-1 truncate text-sm font-medium text-slate-300">
        {user?.username ?? 'Người dùng'}
      </span>

      {/* Logout button */}
      <Tooltip title="Đăng xuất" placement="right">
        <IconButton
          size="small"
          onClick={handleLogout}
          sx={{
            color: 'rgba(148,163,184,1)',
            flexShrink: 0,
            '&:hover': {
              bgcolor: 'rgba(239,68,68,0.1)',
              color: '#ef4444'
            }
          }}
        >
          <LogoutOutlined sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </div>
  );
};

// ─── LeftSidebar ───────────────────────────────────────────────────────────────

const LeftSidebar = () => {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-[#0f172a]">
      {/* Logo */}
      <div className="px-5 py-6">
        <h1 className="text-lg font-bold tracking-tight text-white">
          EduScheduler
        </h1>
      </div>

      <div className="mx-4 h-px bg-white/10" />

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.path} item={item} />
        ))}
      </nav>

      <div className="mx-4 h-px bg-white/10" />

      {/* User section */}
      <UserSection />
    </aside>
  );
};

export default LeftSidebar;
