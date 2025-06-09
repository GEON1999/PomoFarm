import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateGrowth } from '@/store/slices/farmSlice';
import { completePomodoro } from '@/store/slices/userSlice';
import { refreshShop } from '@/store/slices/shopSlice';

// Layout Components
import Layout from '@/components/layout/Layout';

// Page Components
import HomePage from '@/components/pages/HomePage';
import FarmPage from '@/components/pages/FarmPage';
import ShopPage from '@/components/pages/ShopPage';
import SettingsPage from '@/components/pages/SettingsPage';
import NotFoundPage from '@/components/pages/NotFoundPage';

// Common Components
import Notification from '@/components/common/Notification';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isRunning } = useAppSelector((state) => state.timer);
  const { lastUpdated } = useAppSelector((state) => state.farm);
  const { lastLogin } = useAppSelector((state) => state.user);
  const { lastRefresh } = useAppSelector((state) => state.shop);

  // Effect for the game loop (farm updates, timers, etc.)
  useEffect(() => {
    // Set up game loop (runs every second)
    const gameLoop = setInterval(() => {
      // Update farm growth and animal states
      dispatch(updateGrowth());
      
      // Check for completed pomodoros
      // This would be more sophisticated in a real implementation
      if (isRunning) {
        const now = Date.now();
        const lastPomodoro = lastLogin || 0;
        const pomodoroDuration = 25 * 60 * 1000; // 25 minutes in ms
        
        if (now - lastPomodoro >= pomodoroDuration) {
          dispatch(completePomodoro()); // This is correct - Redux Toolkit actions don't need parameters
        }
      }
    }, 1000);

    // Clean up interval on unmount
    return () => clearInterval(gameLoop);
  }, [dispatch, isRunning, lastLogin]);

  // Effect to refresh shop items periodically
  useEffect(() => {
    const refreshInterval = 24 * 60 * 60 * 1000; // 24 hours
    const timeSinceLastRefresh = Date.now() - lastRefresh;
    
    // If it's been more than 24 hours since last refresh, refresh the shop
    if (timeSinceLastRefresh >= refreshInterval) {
      dispatch(refreshShop());
    }
    
    // Set up interval for future refreshes
    const shopRefreshTimer = setTimeout(() => {
      dispatch(refreshShop());
    }, refreshInterval - timeSinceLastRefresh);
    
    return () => clearTimeout(shopRefreshTimer);
  }, [dispatch, lastRefresh]);

  // Effect to handle page title updates
  useEffect(() => {
    const pageTitles: { [key: string]: string } = {
      '/': 'Home | PomoFarm',
      '/farm': 'Farm | PomoFarm',
      '/shop': 'Shop | PomoFarm',
      '/settings': 'Settings | PomoFarm',
    };
    
    document.title = pageTitles[location.pathname] || 'PomoFarm';
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/farm" element={<FarmPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
      
      {/* Global notification component */}
      <Notification />
    </div>
  );
};

export default App;
