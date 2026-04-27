import { createContext, useContext } from 'react';
import type { PersonalizedInvitationData } from '../types';

export interface GuestContextValue {
  data: PersonalizedInvitationData;
  tokenLookup: string;
  refresh: () => void;
}

export const GuestContext = createContext<GuestContextValue | null>(null);

export function useGuest(): GuestContextValue | null {
  return useContext(GuestContext);
}
