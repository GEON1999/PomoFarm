import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { startTimer, pauseTimer, resetTimer, setMode, TimerMode } from '@/store/slices/timerSlice';
import { completePomodoro } from '@/store/slices/userSlice';
import { formatTime } from '@/utils/formatTime';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isRunning, timeLeft, mode, completedPomodoros } = useAppSelector((state) => state.timer);
  const { level, experience } = useAppSelector((state) => state.user);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer modes configuration
  const timerModes: { id: TimerMode; label: string; duration: number }[] = [
    { id: 'focus', label: 'Focus', duration: 25 * 60 },
    { id: 'shortBreak', label: 'Short Break', duration: 5 * 60 },
    { id: 'longBreak', label: 'Long Break', duration: 15 * 60 },
  ];

  // Calculate experience needed for next level
  const expNeededForNextLevel = level * 100;
  const expProgress = (experience / expNeededForNextLevel) * 100;

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0) {
      // Play sound if available
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      
      // Show completion notification
      const modeLabel = timerModes.find(m => m.id === mode)?.label || 'Session';
      setNotificationMessage(`${modeLabel} completed!`);
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      const timer = setTimeout(() => setShowNotification(false), 3000);
      
      // If focus session completed, add rewards
      if (mode === 'focus') {
        dispatch(completePomodoro());
      }
      
      return () => clearTimeout(timer);
    }
  }, [timeLeft, mode]);

  // Toggle timer
  const toggleTimer = () => {
    if (isRunning) {
      dispatch(pauseTimer());
    } else {
      dispatch(startTimer());
    }
  };

  // Reset timer
  const handleReset = () => {
    dispatch(resetTimer());
  };

  // Change timer mode
  const changeMode = (newMode: TimerMode) => {
    if (isRunning) {
      dispatch(pauseTimer());
    }
    dispatch(setMode(newMode));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hidden audio element for timer completion sound */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      
      {/* Timer Display */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
        {/* Mode Selector */}
        <div className="flex justify-center space-x-4 mb-6">
          {timerModes.map((timerMode) => (
            <button
              key={timerMode.id}
              onClick={() => changeMode(timerMode.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                mode === timerMode.id
                  ? 'bg-green-100 text-green-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {timerMode.label}
            </button>
          ))}
        </div>
        
        {/* Timer Circle */}
        <div className="relative w-64 h-64 mx-auto mb-6">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className="fill-none stroke-gray-200"
              strokeWidth="8"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className="fill-none stroke-green-500 transition-all duration-1000 ease-linear"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * timeLeft) / (mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60)}
              transform="rotate(-90 50 50)"
            />
          </svg>
          
          {/* Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-gray-800 mb-1">
              {formatTime(timeLeft)}
            </div>
            <div className="text-gray-500 text-sm uppercase tracking-wider">
              {mode === 'focus' ? 'Time to focus!' : mode === 'shortBreak' ? 'Take a short break' : 'Take a long break'}
            </div>
          </div>
        </div>
        
        {/* Timer Controls */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleTimer}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium text-lg flex items-center transition-colors"
          >
            {isRunning ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Stats & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Pomodoro Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Completed Pomodoros</span>
                <span>{completedPomodoros}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(completedPomodoros % 4) * 25}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{4 - (completedPomodoros % 4)} more until long break</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Session Streak</span>
                <span>{Math.floor(completedPomodoros / 4)} days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(completedPomodoros % 7) * (100/6)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Level & Rewards */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Level & Rewards</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Level {level}</span>
                <span>{experience} / {expNeededForNextLevel} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${expProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{expNeededForNextLevel - experience} XP to next level</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span>Daily Rewards</span>
                <button className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Claim Reward
                </button>
              </div>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div key={day} className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-1">
                      <span className="text-xs font-medium">{day}</span>
                    </div>
                    <div className="w-1 h-1 bg-green-300 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-xl">🌱</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Water Plants</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-xl">🥕</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Harvest</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-xl">🐔</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Feed Animals</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-xl">🎁</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Daily Reward</span>
          </button>
        </div>
      </div>
      
      {/* Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in">
          <span className="mr-2">🎉</span>
          {notificationMessage}
        </div>
      )}
    </div>
  );
};

export default HomePage;
