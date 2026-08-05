import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, LayoutDashboard, Stethoscope, FolderOpen, Info, BookOpen, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, testId: 'nav-dashboard' },
    { path: '/prediction', label: 'Run AI Diagnosis', icon: Stethoscope, testId: 'nav-prediction' },
    { path: '/history', label: 'Records', icon: FolderOpen, testId: 'nav-history' },
    { path: '/glossary', label: 'Glossary', icon: BookOpen, testId: 'nav-glossary' },
    { path: '/about', label: 'SVM Mechanics', icon: Info, testId: 'nav-about' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2" data-testid="nav-logo">
            <Activity className="w-6 h-6 text-[#0284C7]" />
            <span
              className="text-xl font-bold text-[#0F172A]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              OncoSVM AI
            </span>
          </Link>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={item.testId}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-[#F0F9FF] text-[#0284C7]'
                      : 'text-[#475569] hover:text-[#0284C7] hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            <div
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full"
              data-testid="user-menu-trigger"
            >
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#0284C7] flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <span className="text-sm font-medium text-[#0F172A]">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-[#475569] hover:text-[#EF4444] hover:bg-red-50 rounded-md transition-colors duration-200"
              data-testid="logout-button"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
