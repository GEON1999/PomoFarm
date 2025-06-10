import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TimerMode = "focus" | "shortBreak" | "longBreak";

interface TimerState {
  isRunning: boolean;
  mode: TimerMode;
  timeLeft: number; // in seconds
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  completedPomodoros: number;
  endTime: number | null; // Timestamp for when the timer should end
  accumulatedFocusTime: number; // in seconds
}

const initialState: TimerState = {
  isRunning: false,
  mode: "focus",
  timeLeft: 25 * 60,
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  completedPomodoros: 0,
  endTime: null,
  accumulatedFocusTime: 0,
};

const timerSlice = createSlice({
  name: "timer",
  initialState,
  reducers: {
    startTimer: (state) => {
      state.isRunning = true;
      state.endTime = Date.now() + state.timeLeft * 1000;
    },
    pauseTimer: (state) => {
      state.isRunning = false;
    },
    resetTimer: () => initialState,
    tick: (state) => {
      if (!state.isRunning) return;

      if (state.timeLeft > 0) {
        state.timeLeft -= 1;
      } else {
        state.isRunning = false;
        state.endTime = null;

        if (state.mode === "focus") {
          state.completedPomodoros += 1;
          state.mode =
            state.completedPomodoros % 4 === 0 ? "longBreak" : "shortBreak";
          state.timeLeft =
            (state.completedPomodoros % 4 === 0
              ? state.longBreakDuration
              : state.shortBreakDuration) * 60;
        } else {
          state.mode = "focus";
          state.timeLeft = state.focusDuration * 60;
        }
      }
    },
    setMode: (state, action: PayloadAction<TimerMode>) => {
      state.mode = action.payload;
      state.isRunning = false;
      state.endTime = null;

      switch (action.payload) {
        case "focus":
          state.timeLeft = state.focusDuration * 60;
          break;
        case "shortBreak":
          state.timeLeft = state.shortBreakDuration * 60;
          break;
        case "longBreak":
          state.timeLeft = state.longBreakDuration * 60;
          break;
      }
    },
    updateDurations: (
      state,
      action: PayloadAction<{
        focus?: number;
        shortBreak?: number;
        longBreak?: number;
      }>
    ) => {
      const { focus, shortBreak, longBreak } = action.payload;

      if (focus !== undefined) state.focusDuration = focus;
      if (shortBreak !== undefined) state.shortBreakDuration = shortBreak;
      if (longBreak !== undefined) state.longBreakDuration = longBreak;

      if (!state.isRunning) {
        switch (state.mode) {
          case "focus":
            if (focus !== undefined) state.timeLeft = focus * 60;
            break;
          case "shortBreak":
            if (shortBreak !== undefined) state.timeLeft = shortBreak * 60;
            break;
          case "longBreak":
            if (longBreak !== undefined) state.timeLeft = longBreak * 60;
            break;
        }
      }
    },
    syncTimer: (state) => {
      if (state.isRunning && state.endTime) {
        const now = Date.now();
        const remainingTime = Math.round((state.endTime - now) / 1000);
        state.timeLeft = Math.max(0, remainingTime);
      }
    },
    incrementAccumulatedFocusTime: (state) => {
      state.accumulatedFocusTime += 1;
    },
    resetAccumulatedFocusTime: (state) => {
      state.accumulatedFocusTime = 0;
    },
  },
});

export const {
  startTimer,
  pauseTimer,
  resetTimer,
  tick,
  setMode,
  updateDurations,
  syncTimer,
  incrementAccumulatedFocusTime,
  resetAccumulatedFocusTime,
} = timerSlice.actions;

export default timerSlice.reducer;
