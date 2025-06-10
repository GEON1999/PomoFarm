import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import type { InventoryItem } from '@/store/slices/farmSlice';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { diamonds } = useAppSelector((state) => state.user);
  const { inventory } = useAppSelector((state) => state.farm);

  // Calculate total crops and animal products from inventory
  // inventory는 Record<string, InventoryItem>이므로 Object.values로 변환
  const cropCount = Object.values(inventory)
    .filter((item: InventoryItem) => item.itemId.endsWith('_seed'))
    .reduce((sum: number, item: InventoryItem) => sum + item.quantity, 0);

  // 동물 생산품(예: egg, milk 등) 카운트
  const productCount = Object.values(inventory)
    .filter((item: InventoryItem) => !item.itemId.endsWith('_seed'))
    .reduce((sum: number, item: InventoryItem) => sum + item.quantity, 0);

  // Navigation items
  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/farm', icon: '🌱', label: 'Farm' },
    { path: '/shop', icon: '🛍️', label: 'Shop' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">PomoFarm</h1>
          
          {/* Currency Display */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1">
              <span className="text-yellow-300 mr-1">💎</span>
              <span className="font-medium">{diamonds}</span>
            </div>
            <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1">
              <span className="text-green-300 mr-1">🌾</span>
              <span className="font-medium">{cropCount}</span>
            </div>
            <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1">
              <span className="text-orange-200 mr-1">🥚</span>
              <span className="font-medium">{productCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-around">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-3 px-4 ${
                  location.pathname === item.path
                    ? 'text-green-600 border-t-2 border-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
