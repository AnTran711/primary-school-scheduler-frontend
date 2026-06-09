import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarMonth,
  People,
  AccountBalance,
  Class,
  MenuBook,
  LogoutOutlined,
  AssignmentOutlined,
  AssignmentInd,
  ChevronLeftOutlined,
  ChevronRightOutlined
} from '@mui/icons-material';
import { Avatar, Box, IconButton, Tooltip, Typography } from '@mui/material';
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

const SidebarNavItem = ({
  item,
  collapsed
}: {
  item: NavItem;
  collapsed: boolean;
}) => (
  <Tooltip title={collapsed ? item.label : ''} placement="right" arrow>
    <NavLink
      to={item.path}
      style={({ isActive }) => ({
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : 12,
        padding: collapsed ? '10px 0' : '10px 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 8,
        fontSize: '0.875rem',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'all 150ms ease',
        color: isActive ? '#ffffff' : '#94a3b8',
        backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
        overflow: 'hidden'
      })}
    >
      {({ isActive }) => (
        <>
          {/* Active indicator bar */}
          {isActive && (
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 3,
                height: 20,
                borderRadius: '0 4px 4px 0',
                backgroundColor: '#2dd4bf'
              }}
            />
          )}
          {/* Icon */}
          <span
            style={{
              flexShrink: 0,
              display: 'flex',
              color: isActive ? '#2dd4bf' : '#94a3b8'
            }}
          >
            {item.icon}
          </span>
          {/* Label */}
          {!collapsed && (
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {item.label}
            </span>
          )}
        </>
      )}
    </NavLink>
  </Tooltip>
);

// ─── UserSection ───────────────────────────────────────────────────────────────

const UserSection = ({ collapsed }: { collapsed: boolean }) => {
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

  if (collapsed) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          py: 1.5
        }}
      >
        <Tooltip title={user?.username ?? 'Người dùng'} placement="right" arrow>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: '0.8125rem',
              fontWeight: 600,
              bgcolor: 'rgba(45,212,191,0.15)',
              color: '#2dd4bf'
            }}
          >
            {avatarLetter}
          </Avatar>
        </Tooltip>
        <Tooltip title="Đăng xuất" placement="right" arrow>
          <IconButton
            size="small"
            onClick={handleLogout}
            sx={{
              color: '#94a3b8',
              '&:hover': {
                bgcolor: 'rgba(239,68,68,0.1)',
                color: '#ef4444'
              }
            }}
          >
            <LogoutOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 }}>
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

      <Typography
        variant="body2"
        sx={{
          flex: 1,
          fontWeight: 500,
          color: '#cbd5e1',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {user?.username ?? 'Người dùng'}
      </Typography>

      <Tooltip title="Đăng xuất" placement="right">
        <IconButton
          size="small"
          onClick={handleLogout}
          sx={{
            color: '#94a3b8',
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
    </Box>
  );
};

// ─── LeftSidebar ───────────────────────────────────────────────────────────────

const SIDEBAR_EXPANDED_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 64;

const LeftSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  return (
    <Box
      component="aside"
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        width,
        bgcolor: '#0f172a',
        transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
    >
      {/* Logo + Toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 0 : 2.5,
          py: 2,
          minHeight: 64
        }}
      >
        {!collapsed && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              whiteSpace: 'nowrap'
            }}
          >
            EduScheduler
          </Typography>
        )}
        <IconButton
          size="small"
          onClick={() => setCollapsed((prev) => !prev)}
          sx={{
            width: 32,
            height: 32,
            color: '#94a3b8',
            bgcolor: 'rgba(255,255,255,0.05)',
            borderRadius: 1.5,
            transition: 'all 150ms ease',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)',
              color: '#ffffff'
            }
          }}
        >
          {collapsed ? (
            <ChevronRightOutlined sx={{ fontSize: 18 }} />
          ) : (
            <ChevronLeftOutlined sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Box>

      {/* Divider */}
      <Box sx={{ mx: 2, height: '1px', bgcolor: 'rgba(255,255,255,0.08)' }} />

      {/* Navigation */}
      <Box
        component="nav"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: 1.5,
          py: 2
        }}
      >
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </Box>

      {/* Divider */}
      <Box sx={{ mx: 2, height: '1px', bgcolor: 'rgba(255,255,255,0.08)' }} />

      {/* User section */}
      <UserSection collapsed={collapsed} />
    </Box>
  );
};

export default LeftSidebar;
