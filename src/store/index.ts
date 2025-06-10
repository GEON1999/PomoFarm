import { configureStore } from "@reduxjs/toolkit";
import storage from '@/utils/storage';
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { combineReducers } from "redux";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

// Import your reducers
import timerReducer from './slices/timerSlice';
import farmReducer from './slices/farmSlice';
import settingsReducer from './slices/settingsSlice';
import userReducer from './slices/userSlice';
import shopReducer from './slices/shopSlice';
import notificationReducer from './slices/notificationSlice';

// Combine reducers
export const rootReducer = combineReducers({
  timer: timerReducer,
  farm: farmReducer,
  settings: settingsReducer,
  user: userReducer,
  shop: shopReducer,
  notification: notificationReducer,
});

// Define root state type
export type RootState = ReturnType<typeof rootReducer>;

// Load persisted state from localStorage
const persistedState = storage.loadState?.() || undefined;

// Configure store with middleware
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.DEV,
  preloadedState: persistedState,
});

// Subscribe to store changes and persist to localStorage
store.subscribe(() => {
  storage.saveState?.(store.getState());
});

// Create a no-op persistor for now
export const persistor = {
  persist: () => {},
  flush: () => Promise.resolve(),
  pause: () => {},
  purge: () => Promise.resolve(),
  subscribe: () => () => {},
};

// Export store and hooks
export default store;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
