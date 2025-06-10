import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BottomNav: React.FC = () => {
  const { t } = useTranslation();

  const navItems = [
    { path: '/', label: t('home'), icon: '🏠' },
    { path: '/farm', label: t('farm'), icon: '🌳' },
    { path: '/shop', label: t('shop'), icon: '🛒' },
    { path: '/settings', label: t('settings'), icon: '⚙️' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="flex justify-around max-w-screen-sm mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full pt-2 pb-1 text-sm transition-colors duration-200 ${isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-500'}`
            }
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
