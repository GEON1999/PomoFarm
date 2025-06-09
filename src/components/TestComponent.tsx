import React, { useEffect, useState } from 'react';

const TestComponent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Test if Redux is available
    try {
      // @ts-ignore
      if (!window.__REDUX_DEVTOOLS_EXTENSION__) {
        console.warn('Redux DevTools extension is not installed');
      }
    } catch (e) {
      console.warn('Error checking Redux DevTools:', e);
    }

    // Test if React is working
    console.log('TestComponent mounted');
    console.log('React version:', React.version);
    console.log('Environment:', process.env.NODE_ENV);

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-green-600 mb-4">PomoFarm</h1>
        <div className="animate-pulse text-green-500 text-4xl mb-4">🌱</div>
        
        <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-sm font-mono">React: v{React.version}</p>
          <p className="text-sm font-mono">Env: {process.env.NODE_ENV}</p>
          <p className="text-sm font-mono">Screen: {window.innerWidth}×{window.innerHeight}</p>
        </div>
        
        <div className="text-green-600 bg-green-50 p-3 rounded mb-4">
          <p className="font-semibold">Initializing Application</p>
          <p className="text-sm">Checking dependencies and configurations...</p>
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          This message will automatically disappear when the app loads.
          <br />
          Check browser console (F12) for details.
        </p>
      </div>
    </div>
  );
};

export default TestComponent;
