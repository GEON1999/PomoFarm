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
  isOvertime: boolean;
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
  isOvertime: false,
};

const timerSlice = createSlice({
  name: "timer",
  initialState,
  reducers: {
    startTimer: (state) => {
      state.isRunning = true;
      if (!state.isOvertime) {
        state.endTime = Date.now() + state.timeLeft * 1000;
      }
    },
    pauseTimer: (state) => {
      state.isRunning = false;
    },
    resetTimer: (state) => {
      state.isRunning = false;
      state.isOvertime = false;
      state.endTime = null;
      state.mode = "focus";
      state.timeLeft = state.focusDuration * 60;
    },
    tick: (
      state,
      action: PayloadAction<{ autoStartBreaks: boolean; accumulateOvertime: boolean }>,
    ) => {
      if (!state.isRunning) return;

      if (state.mode === "focus") {
        if (!state.isOvertime || (state.isOvertime && action.payload.accumulateOvertime)) {
          state.accumulatedFocusTime += 1;
        }
      }

      if (state.timeLeft > 0 && !state.isOvertime) {
        state.timeLeft -= 1;
      } else {
        if (state.mode === "focus") {
          if (!state.isOvertime) {
            state.completedPomodoros += 1;
          }

          if (action.payload.autoStartBreaks) {
            state.mode =
              state.completedPomodoros % 4 === 0 ? "longBreak" : "shortBreak";
            state.timeLeft =
              (state.completedPomodoros % 4 === 0
                ? state.longBreakDuration
                : state.shortBreakDuration) * 60;
            state.isOvertime = false;
            state.endTime = Date.now() + state.timeLeft * 1000;
          } else {
            state.isOvertime = true;
            state.timeLeft += 1; // Count up for overtime
          }
        } else {
          // End of a break
          state.mode = "focus";
          state.timeLeft = state.focusDuration * 60;
          state.isOvertime = false;
          state.endTime = Date.now() + state.timeLeft * 1000;
        }
      }
    },
    setMode: (state, action: PayloadAction<TimerMode>) => {
      state.mode = action.payload;
      state.isRunning = false;
      state.isOvertime = false;
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
      if (state.isRunning && state.endTime && !state.isOvertime) {
        const now = Date.now();
        const remainingTime = Math.round((state.endTime - now) / 1000);
        state.timeLeft = Math.max(0, remainingTime);
      }
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
  resetAccumulatedFocusTime,
} = timerSlice.actions;

export default timerSlice.reducer;
