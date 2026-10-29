import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { VehicleCard } from '@/types/vehicle.types';

const KEY = 'vm-compare';
const MAX = 3;

interface CompareState {
  items: VehicleCard[];
}

const initial: CompareState = {
  items: (() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]') as VehicleCard[];
    } catch {
      return [];
    }
  })(),
};

const persist = (items: VehicleCard[]) => localStorage.setItem(KEY, JSON.stringify(items));

export const compareSlice = createSlice({
  name: 'compare',
  initialState: initial,
  reducers: {
    toggleCompare: (state, { payload }: PayloadAction<VehicleCard>) => {
      const idx = state.items.findIndex((v) => v.id === payload.id);
      if (idx >= 0) state.items.splice(idx, 1);
      else if (state.items.length < MAX) state.items.push(payload);
      persist(state.items);
    },
    removeCompare: (state, { payload }: PayloadAction<string>) => {
      state.items = state.items.filter((v) => v.id !== payload);
      persist(state.items);
    },
    clearCompare: (state) => {
      state.items = [];
      persist(state.items);
    },
  },
});

export const { toggleCompare, removeCompare, clearCompare } = compareSlice.actions;
export const selectCompare = (s: { compare: CompareState }) => s.compare.items;
export const compareReducer = compareSlice.reducer;
