import { Link, Outlet, useLocation } from 'react-router-dom';
import { Folder, Heart, Home, UserRound, Video } from 'lucide-react';

const navItems = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Streaming', to: '/streaming', icon: Video },
  { label: 'Categories', to: '/categories', icon: Folder },
  { label: 'Sharing', to: '/sharing', icon: Heart },
  { label: 'Me', to: '/me', icon: UserRound },
];

const activeLabel = (pathname) => {
  const direct = navItems.find((item) => item.to === pathname);
  if (direct) return direct.label;
  if (pathname.startsWith('/streaming')) return 'Streaming';
  if (pathname.startsWith('/title') || pathname.startsWith('/search') || pathname.startsWith('/player')) return 'Home';
  return '';
};

export default function AppShell({ children }) {
  const { pathname } = useLocation();
  const active = activeLabel(pathname);

  return (
    <div className="app-shell">
      <main className="main-content">{children || <Outlet />}</main>
      <nav className="bottom-nav" aria-label="Main navigation">
        {navItems.map(({ label, to, icon: Icon }) => (
          <Link key={to} to={to} className={`nav-item ${active === label ? 'active' : ''}`}>
            <Icon size={21} strokeWidth={active === label ? 2.5 : 1.65} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}