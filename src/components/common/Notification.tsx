import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { hideNotification } from '@/store/slices/notificationSlice';

const Notification: React.FC = () => {
  const dispatch = useAppDispatch();
  const { message, type } = useAppSelector((state) => state.notification);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [message, dispatch]);

  const handleClose = () => {
    dispatch(hideNotification());
  };

  if (!show || !message) return null;

  const getNotificationStyles = () => {
    const baseStyles =
      'fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg flex items-center transition-all duration-300 transform';

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-100 text-green-800 border-l-4 border-green-500`;
      case 'error':
        return `${baseStyles} bg-red-100 text-red-800 border-l-4 border-red-500`;
      case 'warning':
        return `${baseStyles} bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-100 text-blue-800 border-l-4 border-blue-500`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={getNotificationStyles()}>
      <span className="text-xl mr-2">{getIcon()}</span>
      <span>{message}</span>
      <button
        onClick={handleClose}
        className="ml-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </div>
  );
};

export default Notification;
