import { NavLink } from 'react-router-dom';
import {
  CalendarMonth,
  People,
  AccountBalance,
  Class,
  MenuBook
} from '@mui/icons-material';

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
    path: '/schools'
  },
  { label: 'Lớp học', icon: <Class fontSize="small" />, path: '/classes' },
  { label: 'Môn học', icon: <MenuBook fontSize="small" />, path: '/subjects' }
];

// ─── NavItem Component ─────────────────────────────────────────────────────────

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
        {/* Active indicator bar */}
        {isActive && (
          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-teal-400" />
        )}

        {/* Icon */}
        <span className={isActive ? 'text-teal-400' : ''}>{item.icon}</span>

        {/* Label */}
        <span>{item.label}</span>
      </>
    )}
  </NavLink>
);

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

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.path} item={item} />
        ))}
      </nav>
    </aside>
  );
};

export default LeftSidebar;
