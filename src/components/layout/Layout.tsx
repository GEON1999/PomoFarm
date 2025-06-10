import React, { useState } from "react";
import { useAppSelector } from "@/store";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/ui/Logo";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { diamonds, gold } = useAppSelector((state) => state.user);
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/farm", label: "Farm" },
    { path: "/shop", label: "Shop" },
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
            {/* <nav className="hidden md:flex items-center space-x-8">
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
            </nav> */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-200/50 dark:bg-gray-700/50 rounded-full px-3 py-1.5">
                <span className="text-xl mr-2">💎</span>
                <span className="font-bold text-lg text-gray-800 dark:text-white">
                  {diamonds}
                </span>
              </div>
              <div className="flex items-center bg-gray-200/50 dark:bg-gray-700/50 rounded-full px-3 py-1.5">
                <span className="text-xl mr-2">💰</span>
                <span className="font-bold text-lg text-gray-800 dark:text-white">
                  {gold}
                </span>
              </div>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${ 
                    location.pathname === link.path
                      ? 'text-white bg-green-600'
                      : 'text-gray-600 dark:text-gray-300 hover:text-white hover:bg-green-500'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )} */}
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
};

export default Layout;
