import { ThunkAction } from '@reduxjs/toolkit';
import { RootState } from './index';
import { UnknownAsyncThunkAction } from '@reduxjs/toolkit/dist/matchers';

// Define the AppThunk type for our thunks
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAsyncThunkAction
>;

// This type can be used to type the 'dispatch' function in your components
export type AppDispatch = (action: any) => any; // This will be properly typed by the store

// Add other shared types here as needed
