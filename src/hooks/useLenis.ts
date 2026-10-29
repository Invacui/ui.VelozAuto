import { useContext } from 'react';
import { LenisContext } from '@/contexts/LenisContext';

export function useLenis() {
  return useContext(LenisContext);
}
