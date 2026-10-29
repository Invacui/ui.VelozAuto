import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './auth.slice';
import { compareReducer } from './compare.slice';
import { uiReducer } from './ui.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    compare: compareReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
