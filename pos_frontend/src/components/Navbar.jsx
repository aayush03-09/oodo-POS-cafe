import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin-portal/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin-portal/bookings', label: 'Bookings', icon: '📅' },
  { to: '/admin-portal/products', label: 'Products', icon: '📦' },
  { to: '/admin-portal/categories', label: 'Categories', icon: '🏷' },
  { to: '/admin-portal/floors', label: 'Floors', icon: '🏢' },
  { to: '/admin-portal/reports', label: 'Reports', icon: '📋' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark-theme'));
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const links = user?.role === 'admin' ? adminLinks : [];

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-lime-400 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow">☕</div>
          <span className="text-lg font-bold text-slate-700">POS Cafe</span>
        </div>
        <div className="hidden md:flex items-center gap-1 ml-4">
          {links.map(link => (
            <Link key={link.to} to={link.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === link.to
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}>
              <span className="mr-1">{link.icon}</span>{link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500 hidden md:inline">
          {user?.username} <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-600 text-xs font-medium">{user?.role}</span>
        </span>
        <button onClick={() => {
          document.documentElement.classList.toggle('dark-theme');
          setIsDark(!isDark);
        }} className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all text-sm ml-2">
          {isDark ? '☀️' : '🌙'}
        </button>
        <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-sm font-medium transition-all">
          Logout
        </button>
      </div>
    </nav>
  );
}
