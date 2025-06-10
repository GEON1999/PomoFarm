import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  language: string;
  autoStartBreaks: boolean;
  accumulateOvertime: boolean;
}

const initialState: SettingsState = {
  language: "ko",
  autoStartBreaks: false,
  accumulateOvertime: true,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setAutoStartBreaks: (state, action: PayloadAction<boolean>) => {
      state.autoStartBreaks = action.payload;
    },
    setAccumulateOvertime: (state, action: PayloadAction<boolean>) => {
      state.accumulateOvertime = action.payload;
    },
  },
});

export const { setLanguage, setAutoStartBreaks, setAccumulateOvertime } = settingsSlice.actions;
export default settingsSlice.reducer;
