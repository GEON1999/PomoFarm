import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  startTimer,
  pauseTimer,
  resetTimer,
  setMode,
  tick,
  updateDurations,
  TimerMode,
} from "@/store/slices/timerSlice";
import { completePomodoro } from "@/store/slices/userSlice";
import { formatTime } from "@/utils/formatTime";

// 스크롤 방식의 시간 선택 UI 컴포넌트
const MinutePickerOrTimer: React.FC<{
  mode: string;
  isRunning: boolean;
  focusDuration: number;
  timeLeft: number;
  onSelectMinute: (min: number) => void;
}> = ({ mode, isRunning, focusDuration, onSelectMinute, timeLeft }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemHeight = 64; // h-16 (4rem)
  const minVal = 1;
  const maxVal = 120;
  const scrollEndTimer = useRef<NodeJS.Timeout>();

  // 스크롤이 멈춘 후, CSS 스냅에 의해 중앙에 위치한 값을 읽어 상태를 업데이트합니다.
  const handleScroll = useCallback(() => {
    clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      if (scrollRef.current) {
        const scrollTop = scrollRef.current.scrollTop;
        const selectedIndex = Math.round(scrollTop / itemHeight);
        const finalValue = Math.max(minVal, Math.min(maxVal, selectedIndex + minVal));
        
        if (finalValue !== focusDuration) {
          onSelectMinute(finalValue);
        }
      }
    }, 150); // 150ms 동안 스크롤이 없으면 멈춘 것으로 간주합니다.
  }, [focusDuration, onSelectMinute]);

  // 최초 렌더링 시에만 스크롤 위치를 현재 focusDuration에 맞게 설정합니다.
  // 스크롤 안정성을 위해, 이후 focusDuration 변경은 이 컴포넌트의 스크롤을 통해서만 이루어집니다.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (focusDuration - minVal) * itemHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 마운트 시에만 실행합니다.

  // focus 모드가 아니거나 타이머 실행 중일 때는 일반 타이머 표시
  if (mode !== 'focus' || isRunning) {
    return (
      <div className="text-7xl font-light text-gray-800 select-none">
        {formatTime(timeLeft)}
      </div>
    );
  }

  const minutes = Array.from({ length: maxVal - minVal + 1 }, (_, i) => i + minVal);

  // 스크롤 피커 UI
  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-64 w-64 overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)',
      }}
    >
      {/* 위아래 패딩: 첫번째와 마지막 아이템이 중앙에 올 수 있도록 함 */}
      <div className="h-24" />
      {minutes.map((minute) => (
        <div
          key={minute}
          className="h-16 flex items-center justify-center snap-center"
        >
          <span
            className="text-6xl font-light text-gray-800 transition-all duration-200"
            style={{
              opacity: minute === focusDuration ? 1 : 0.25,
              transform: `scale(${minute === focusDuration ? 1 : 0.7})`,
            }}
          >
            {String(minute).padStart(2, '0')}:00
          </span>
        </div>
      ))}
      <div className="h-24" />
    </div>
  );
};

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isRunning,
    timeLeft,
    mode,
    completedPomodoros,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
  } = useAppSelector((state) => state.timer);
  const { level, experience } = useAppSelector((state) => state.user);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer modes configuration
  const timerModes: { id: TimerMode; label: string; duration: number }[] = [
    { id: "focus", label: "Focus", duration: 25 * 60 },
    { id: "shortBreak", label: "Short Break", duration: 5 * 60 },
    { id: "longBreak", label: "Long Break", duration: 15 * 60 },
  ];

  // Calculate experience needed for next level
  const expNeededForNextLevel = level * 100;
  const expProgress = (experience / expNeededForNextLevel) * 100;

  // 실제 타이머 동작: isRunning이 true일 때 1초마다 tick() 디스패치
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      dispatch(tick());
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, dispatch]);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0) {
      // Play sound if available
      if (audioRef.current) {
        audioRef.current
          .play()
          .catch((e) => console.log("Audio play failed:", e));
      }

      // Show completion notification
      const modeLabel =
        timerModes.find((m) => m.id === mode)?.label || "Session";
      setNotificationMessage(`${modeLabel} completed!`);
      setShowNotification(true);

      // Hide notification after 3 seconds
      const timer = setTimeout(() => setShowNotification(false), 3000);

      // If focus session completed, add rewards
      if (mode === "focus") {
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
                  ? "bg-green-100 text-green-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {timerMode.label}
            </button>
          ))}
        </div>

        {/* Timer Circle (반응형 크기) */}
        <div className="relative w-full max-w-[32rem] aspect-square mx-auto mb-12"> {/* 모바일 대응: w-full, max-w, aspect-square */}
          <svg className="w-full h-auto" viewBox="0 0 200 200"> {/* viewBox 확장 */}
            {/* 배경 원 */}
            <circle
              cx="100"
              cy="100"
              r="90"
              className="fill-none stroke-gray-200"
              strokeWidth="16"
            />
            {/* 진행도 원 */}
            <circle
              cx="100"
              cy="100"
              r="90"
              className="fill-none stroke-green-500 transition-all duration-1000 ease-linear"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray="565"
              strokeDashoffset={(() => {
                let duration = 1500; // default 25*60
                if (mode === "focus") duration = focusDuration * 60;
                else if (mode === "shortBreak")
                  duration = shortBreakDuration * 60;
                else if (mode === "longBreak")
                  duration = longBreakDuration * 60;
                return 565 - (565 * timeLeft) / duration;
              })()}
              transform="rotate(-90 100 100)"
            />

          </svg>

          {/* Timer Display with scrollable minute picker */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <MinutePickerOrTimer
              mode={mode}
              isRunning={isRunning}
              focusDuration={focusDuration}
              timeLeft={timeLeft}
              onSelectMinute={(min) =>
                dispatch(updateDurations({ focus: min }))
              }
            />
            <div className="text-gray-500 text-sm uppercase tracking-wider">
              {mode === "focus"
                ? "Time to focus!"
                : mode === "shortBreak"
                ? "Take a short break"
                : "Take a long break"}
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
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Today's Progress
          </h2>
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
              <p className="text-xs text-gray-500 mt-1">
                {4 - (completedPomodoros % 4)} more until long break
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Session Streak</span>
                <span>{Math.floor(completedPomodoros / 4)} days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(completedPomodoros % 7) * (100 / 6)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Level & Rewards */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Level & Rewards
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Level {level}</span>
                <span>
                  {experience} / {expNeededForNextLevel} XP
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${expProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {expNeededForNextLevel - experience} XP to next level
              </p>
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
            <span className="text-sm font-medium text-gray-700">
              Water Plants
            </span>
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
            <span className="text-sm font-medium text-gray-700">
              Feed Animals
            </span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-xl">🎁</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              Daily Reward
            </span>
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
