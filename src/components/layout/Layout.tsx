import React from 'react';
import { useAppSelector } from '@/store';
import { Link, useLocation } from 'react-router-dom';
import Logo from '@/components/ui/Logo';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { diamonds, gold } = useAppSelector((state) => state.user);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/farm', label: 'Farm' },
    { path: '/shop', label: 'Shop' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to="/">
                <Logo />
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-lg font-medium transition-colors duration-200 ${ 
                    location.pathname === link.path
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-200/50 dark:bg-gray-700/50 rounded-full px-3 py-1.5">
                <span className="text-xl mr-2">💎</span>
                <span className="font-bold text-lg text-gray-800 dark:text-white">{diamonds}</span>
              </div>
              <div className="flex items-center bg-gray-200/50 dark:bg-gray-700/50 rounded-full px-3 py-1.5">
                <span className="text-xl mr-2">💰</span>
                <span className="font-bold text-lg text-gray-800 dark:text-white">{gold}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
};

export default Layout;
