import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
}

const initialState: UiState = {
  sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: { payload: boolean }) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen } = uiSlice.actions;
export const selectSidebarOpen = (s: { ui: UiState }) => s.ui.sidebarOpen;

export const uiReducer = uiSlice.reducer;
