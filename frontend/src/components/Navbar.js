import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, LayoutDashboard, Stethoscope, FolderOpen, Info, BookOpen, LogOut, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <Link to="/dashboard" className="flex items-center space-x-2 min-w-0" data-testid="nav-logo">
            <Activity className="w-6 h-6 text-[#0284C7] flex-shrink-0" />
            <span
              className="text-lg sm:text-xl font-bold text-[#0F172A] truncate"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              OncoSVM AI
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
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

          <div className="hidden md:flex items-center space-x-3">
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

          <button
            className="md:hidden p-2 rounded-md text-[#0F172A] hover:bg-slate-100"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={item.testId}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
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
            <div className="flex items-center justify-between px-3 pt-2 border-t border-slate-100 mt-2 pt-3">
              <div className="flex items-center space-x-2">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#0284C7] flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <span className="text-sm font-medium text-[#0F172A]">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-2 py-1.5 text-sm text-[#475569] hover:text-[#EF4444] rounded-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
