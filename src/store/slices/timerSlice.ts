import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerState {
  isRunning: boolean;
  mode: TimerMode;
  timeLeft: number; // in seconds
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  completedPomodoros: number;
}

const initialState: TimerState = {
  isRunning: false,
  mode: 'focus',
  timeLeft: 25 * 60, // 25 minutes in seconds
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  completedPomodoros: 0,
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    startTimer: (state) => {
      state.isRunning = true;
    },
    pauseTimer: (state) => {
      state.isRunning = false;
    },
    resetTimer: (state) => {
      state.isRunning = false;
      state.timeLeft = state.focusDuration * 60;
      state.mode = 'focus';
    },
    tick: (state) => {
      if (state.timeLeft > 0) {
        state.timeLeft -= 1;
      } else {
        state.isRunning = false;
        
        // Handle timer completion
        if (state.mode === 'focus') {
          state.completedPomodoros += 1;
          // After 4 pomodoros, take a long break, otherwise short break
          state.mode = state.completedPomodoros % 4 === 0 ? 'longBreak' : 'shortBreak';
          state.timeLeft = (state.completedPomodoros % 4 === 0 ? state.longBreakDuration : state.shortBreakDuration) * 60;
        } else {
          // Break is over, go back to focus
          state.mode = 'focus';
          state.timeLeft = state.focusDuration * 60;
        }
      }
    },
    setMode: (state, action: PayloadAction<TimerMode>) => {
      state.mode = action.payload;
      state.isRunning = false;
      
      // Reset timer based on the new mode
      switch (action.payload) {
        case 'focus':
          state.timeLeft = state.focusDuration * 60;
          break;
        case 'shortBreak':
          state.timeLeft = state.shortBreakDuration * 60;
          break;
        case 'longBreak':
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
      
      if (focus !== undefined) {
        state.focusDuration = focus;
        if (state.mode === 'focus') {
          state.timeLeft = focus * 60;
        }
      }
      
      if (shortBreak !== undefined) {
        state.shortBreakDuration = shortBreak;
        if (state.mode === 'shortBreak') {
          state.timeLeft = shortBreak * 60;
        }
      }
      
      if (longBreak !== undefined) {
        state.longBreakDuration = longBreak;
        if (state.mode === 'longBreak') {
          state.timeLeft = longBreak * 60;
        }
      }
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
} = timerSlice.actions;

export default timerSlice.reducer;
