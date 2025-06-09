import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationState {
  message: string | null;
  type: NotificationType;
}

const initialState: NotificationState = {
  message: null,
  type: 'info', // default type
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<{ message: string; type?: NotificationType }>,
    ) => {
      state.message = action.payload.message;
      state.type = action.payload.type || 'info';
    },
    hideNotification: (state) => {
      state.message = null;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
