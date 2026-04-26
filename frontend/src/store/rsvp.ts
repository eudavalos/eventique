import { create } from 'zustand';

interface RSVPStore {
  step: number;
  submitted: boolean;
  attending: 'yes' | 'no' | null;
  setStep: (step: number) => void;
  setAttending: (v: 'yes' | 'no') => void;
  setSubmitted: () => void;
  reset: () => void;
}

export const useRSVPStore = create<RSVPStore>((set) => ({
  step: 1,
  submitted: false,
  attending: null,
  setStep: (step) => set({ step }),
  setAttending: (attending) => set({ attending }),
  setSubmitted: () => set({ submitted: true }),
  reset: () => set({ step: 1, submitted: false, attending: null }),
}));
