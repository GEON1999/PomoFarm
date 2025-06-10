import React, { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  startTimer,
  pauseTimer,
  resetTimer,
  resetAccumulatedFocusTime,
  setMode,
  updateDurations,
  TimerMode,
} from "@/store/slices/timerSlice";
import { completePomodoro } from "@/store/slices/userSlice";
import { formatTime } from "@/utils/formatTime";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    isRunning,
    timeLeft,
    mode,
    completedPomodoros,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    accumulatedFocusTime,
  } = useAppSelector((state) => state.timer);
  const { level, experience } = useAppSelector((state) => state.user);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const timerModes: { id: TimerMode; label: string; color: string }[] = [
    { id: "focus", label: t("focus"), color: "bg-rose-500" },
    { id: "shortBreak", label: t("shortBreak"), color: "bg-cyan-500" },
    { id: "longBreak", label: t("longBreak"), color: "bg-indigo-500" },
  ];

  const activeMode = timerModes.find((m) => m.id === mode) || timerModes[0];
  const totalDuration =
    mode === "focus"
      ? focusDuration * 60
      : mode === "shortBreak"
      ? shortBreakDuration * 60
      : longBreakDuration * 60;

  const expNeededForNextLevel = level * 100;
  const expProgress =
    expNeededForNextLevel > 0 ? (experience / expNeededForNextLevel) * 100 : 0;

  useEffect(() => {
    if (timeLeft === 0 && totalDuration > 0) {
      audioRef.current
        ?.play()
        .catch((e) => console.log("Audio play failed:", e));
      if (mode === "focus") {
        dispatch(completePomodoro());
      }
      // TODO: Automatically switch to the next mode
    }
  }, [timeLeft, mode, dispatch, totalDuration]);

  const toggleTimer = () => {
    if (isRunning) dispatch(pauseTimer());
    else dispatch(startTimer());
  };

  const handleReset = () => dispatch(resetTimer());

  const handleResetAccumulatedTime = () => {
    if (window.confirm(t("confirmReset"))) {
      dispatch(resetAccumulatedFocusTime());
    }
  };

  const changeMode = (newMode: TimerMode) => {
    if (isRunning) dispatch(pauseTimer());
    dispatch(setMode(newMode));
  };

  const handleUpdateDuration = (amount: number) => {
    if (isRunning || mode !== "focus") return;
    const newDuration = focusDuration + amount;
    if (newDuration >= 5 && newDuration <= 120) {
      dispatch(updateDurations({ focus: newDuration }));
    }
  };

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    totalDuration > 0
      ? circumference - (timeLeft / totalDuration) * circumference
      : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 font-sans">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      <motion.div
        layout
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        className={`w-full max-w-md rounded-3xl shadow-2xl p-8 transition-colors duration-500 ${activeMode.color}`}
      >
        <div className="flex justify-center mb-8">
          {timerModes.map(({ id, label }) => (
            <motion.button
              key={id}
              onClick={() => changeMode(id)}
              className={`px-5 py-2 rounded-full font-semibold text-white/80 relative`}
              animate={{
                color: mode === id ? "white" : "rgba(255,255,255,0.7)",
              }}
            >
              {mode === id && (
                <motion.div
                  layoutId="active-mode-bg"
                  className="absolute inset-0 bg-black/20 rounded-full"
                  transition={{ type: "spring", damping: 15, stiffness: 250 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </motion.button>
          ))}
        </div>

        <motion.div
          className="relative w-60 h-60 sm:w-72 sm:h-72 mx-auto mb-8"
          initial={false}
        >
          <svg
            className="absolute inset-0"
            width="100%"
            height="100%"
            viewBox="0 0 300 300"
          >
            <circle
              cx="150"
              cy="150"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="12"
            />
            <motion.circle
              cx="150"
              cy="150"
              r={radius}
              fill="none"
              stroke="white"
              strokeWidth="12"
              strokeLinecap="round"
              transform="rotate(-90 150 150)"
              style={{ strokeDasharray: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={timeLeft}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="text-5xl sm:text-6xl font-bold text-white tracking-tighter"
              >
                {formatTime(timeLeft)}
              </motion.div>
            </AnimatePresence>
            <div className="text-sm text-white/70 tracking-widest">
              {formatTime(totalDuration)}
            </div>
          </div>
        </motion.div>

        {mode === "focus" && !isRunning && (
          <div className="flex justify-center items-center gap-4 mb-8 text-white">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleUpdateDuration(-5)}
              className="w-10 h-10 rounded-full bg-black/20 text-2xl"
            >
              -
            </motion.button>
            <span className="text-lg font-semibold">{focusDuration} min</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleUpdateDuration(5)}
              className="w-10 h-10 rounded-full bg-black/20 text-2xl"
            >
              +
            </motion.button>
          </div>
        )}

        <div className="flex justify-center space-x-4 mt-8">
          <motion.button
            onClick={toggleTimer}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-4 bg-white text-rose-500 rounded-full font-bold text-xl shadow-lg"
          >
            {isRunning ? t("pause") : t("start")}
          </motion.button>
          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 bg-white/20 text-white rounded-full font-bold text-md shadow-lg flex items-center justify-center"
          >
            {t("reset")}
          </motion.button>
        </div>
      </motion.div>

      <div className="w-full max-w-md mt-8 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <p className="text-lg text-gray-800">
            {t("totalFocusTime")}:{" "}
            {Math.floor((accumulatedFocusTime || 0) / 3600)}h{" "}
            {Math.floor(((accumulatedFocusTime || 0) % 3600) / 60)}m{" "}
            {(accumulatedFocusTime || 0) % 60}s
          </p>
          <button
            onClick={handleResetAccumulatedTime}
            className="text-sm text-gray-500 hover:text-gray-700 underline mt-2"
          >
            {t("resetAccumulatedTime")}
          </button>
        </div>
      </div>

      <div className="w-full max-w-md mt-8 bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {t("statistics")}
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-gray-700">
                {t("level")} {level}
              </h3>
              <p className="text-sm font-semibold text-gray-600">
                {experience} / {expNeededForNextLevel} {t("exp")}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <motion.div
                className="bg-blue-500 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${expProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
          <div className="text-center bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-700">
              {t("completedPomodoros")}
            </h3>
            <p className="text-3xl font-bold text-green-500">
              {completedPomodoros}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
