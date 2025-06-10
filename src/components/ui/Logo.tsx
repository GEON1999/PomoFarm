import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 1.94.78 3.69 2.05 4.95C7.02 14.23 7 14.61 7 15v1c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-1c0-.39-.02-.77-.05-1.05C18.22 12.69 19 10.94 19 9c0-3.87-3.13-7-7-7z"
          fill="#EF4444" // Red-500 for tomato body
        />
        <path
          d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM10 5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM14 5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
          fill="#F59E0B" // Amber-400 for tomato top spots
        />
        <path
          d="M12 3c.3 0 .58.1.82.26.41-.16.85-.26 1.32-.26 1.1 0 2.1.45 2.83 1.17.24-.16.52-.27.83-.27 1.1 0 2 .9 2 2 0 .44-.14.86-.39 1.2.37.53.59 1.17.59 1.85 0 1.66-1.34 3-3 3-.96 0-1.81-.45-2.37-1.15C13.21 10.53 12.66 11 12 11c-1.66 0-3-1.34-3-3 0-.68.22-1.32.59-1.85C9.14 5.76 9 5.34 9 4.9c0-1.1.9-2 2-2 .31 0 .6.07.86.2C11.93 3.05 11.96 3 12 3z"
          transform="translate(-5, -3) scale(0.8)"
          fill="#22C55E" // Green-500 for the leaf/stem
        />
      </svg>
      <span className="text-xl font-bold text-gray-800 dark:text-white">
        PomoFarm
      </span>
    </div>
  );
};

export default Logo;
