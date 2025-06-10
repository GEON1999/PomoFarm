import { ThunkAction, AnyAction } from '@reduxjs/toolkit';
import { RootState } from './index';

// Define the AppThunk type for our thunks
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

// This type can be used to type the 'dispatch' function in your components
export type AppDispatch = (action: any) => any; // This will be properly typed by the store

// Add other shared types here as needed
