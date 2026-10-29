import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const savedUser = localStorage.getItem('vm-user');
const savedToken = localStorage.getItem('vm-token');
const savedRefreshToken = localStorage.getItem('vm-refresh-token');

const initialState: AuthState = {
  user: savedUser ? (JSON.parse(savedUser) as User) : null,
  accessToken: savedToken || null,
  refreshToken: savedRefreshToken || null,
  isAuthenticated: !!savedUser,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      { payload }: PayloadAction<{ user: User; accessToken: string; refreshToken?: string }>,
    ) => {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.isAuthenticated = true;
      if (payload.refreshToken) {
        state.refreshToken = payload.refreshToken;
        localStorage.setItem('vm-refresh-token', payload.refreshToken);
      }
      localStorage.setItem('vm-user', JSON.stringify(payload.user));
      localStorage.setItem('vm-token', payload.accessToken);
    },
    setToken: (state, { payload }: PayloadAction<string>) => {
      state.accessToken = payload;
      localStorage.setItem('vm-token', payload);
    },
    setRefreshToken: (state, { payload }: PayloadAction<string>) => {
      state.refreshToken = payload;
      localStorage.setItem('vm-refresh-token', payload);
    },
    updateUser: (state, { payload }: PayloadAction<User>) => {
      state.user = payload;
      localStorage.setItem('vm-user', JSON.stringify(payload));
    },
    clearAuth: (state) => {
      Object.assign(state, { user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      localStorage.removeItem('vm-user');
      localStorage.removeItem('vm-token');
      localStorage.removeItem('vm-refresh-token');
    },
  },
});

export const { setAuth, setToken, setRefreshToken, updateUser, clearAuth } = authSlice.actions;

export const selectUser = (s: { auth: AuthState }) => s.auth.user;
export const selectIsAuthenticated = (s: { auth: AuthState }) => s.auth.isAuthenticated;
export const selectAccessToken = (s: { auth: AuthState }) => s.auth.accessToken;
export const selectRefreshToken = (s: { auth: AuthState }) => s.auth.refreshToken;
export const selectUserRole = (s: { auth: AuthState }) => s.auth.user?.role ?? null;

export const authReducer = authSlice.reducer;
