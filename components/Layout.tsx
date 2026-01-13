
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Role, UserAccount } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserAccount | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', roles: [Role.GUEST, Role.SEEKER, Role.GUIDE] },
    { path: '/mood', label: 'Mood', roles: [Role.SEEKER, Role.GUIDE] },
    { path: '/goals', label: 'Goals', roles: [Role.SEEKER, Role.GUIDE] },
    { path: '/routine', label: 'To-Do', roles: [Role.SEEKER, Role.GUIDE] },
    { path: '/journal', label: 'Journal', roles: [Role.SEEKER, Role.GUIDE] },
    { path: '/gratitude', label: 'Gratitude', roles: [Role.SEEKER, Role.GUIDE] },
    { path: '/therapy', label: 'Sanctuary', roles: [Role.GUEST, Role.SEEKER, Role.GUIDE] },
    { path: '/emergency', label: 'Care', roles: [Role.GUIDE] },
    { path: '/settings', label: 'Settings', roles: [Role.GUIDE] },
  ];

  if (!user) {
    return <main className="min-h-screen bg-[#f9f9f7]">{children}</main>;
  }

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f7]">
      {/* Elegant Top Nav */}
      <nav className="bg-white border-b border-[#e5e5df] sticky top-0 z-50 h-20">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/dashboard" className="text-2xl font-serif font-bold italic tracking-tight text-[#4a4a45]">
              Serenity
            </Link>
            <span className="text-[10px] bg-[#f9f9f7] px-2 py-0.5 border border-[#e5e5df] text-[#cbcbca] uppercase tracking-widest ml-3 hidden sm:inline">
              {user.role}
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[9px] uppercase tracking-[0.2em] transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'text-[#4a4a45] font-bold border-b border-[#4a4a45] pb-1'
                    : 'text-[#8e8e8a] hover:text-[#4a4a45]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="h-4 w-px bg-[#f1f1ee] mx-2" />
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-widest text-[#cbcbca] font-medium leading-none mb-1">{user.name}</span>
              <button 
                onClick={onLogout}
                className="text-[9px] uppercase tracking-[0.2em] text-red-400 hover:text-red-700 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="lg:hidden p-2 text-[#4a4a45] focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M4 16h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-white transition-transform duration-500 ease-in-out transform ${
          isMenuOpen ? 'translate-y-0' : 'translate-y-full'
        } lg:hidden`}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-8 bg-[#f9f9f7]">
          <p className="text-[10px] uppercase tracking-widest text-[#cbcbca] mb-4">Logged in as {user.name} ({user.role})</p>
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={`text-lg uppercase tracking-[0.4em] font-light transition-colors ${
                location.pathname === item.path ? 'text-[#4a4a45] font-bold' : 'text-[#8e8e8a]'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button 
            onClick={() => {
              onLogout();
              setIsMenuOpen(false);
            }}
            className="text-xs uppercase tracking-[0.3em] text-red-700 pt-8"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-[#e5e5df] text-center text-[#8e8e8a] text-[10px] uppercase tracking-[0.3em]">
        &copy; {new Date().getFullYear()} Serenity Wellness Suite • Role-Based Harmony
      </footer>
    </div>
  );
};

export default Layout;
