import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
      state.user = action.payload?.user || null;
      state.isLoading = false;
      state.isInitialized = true;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
      state.isLoading = false;
      state.isInitialized = true;
    },
  },
});

export const { setSession, setLoading, clearAuth } = authSlice.actions;
export default authSlice.reducer;