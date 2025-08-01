import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import languagePairsReducer from './slices/languagePairsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    languagePairs: languagePairsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;