import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  sportIds: string[];
  setPreferences: (sportIds: string[]) => void;
  addSport: (sportId: string) => void;
  removeSport: (sportId: string) => void;
  clearPreferences: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      sportIds: [],
      setPreferences: (sportIds) => set({ sportIds }),
      addSport: (sportId) =>
        set((state) => ({
          sportIds: state.sportIds.includes(sportId)
            ? state.sportIds
            : [...state.sportIds, sportId],
        })),
      removeSport: (sportId) =>
        set((state) => ({
          sportIds: state.sportIds.filter((id) => id !== sportId),
        })),
      clearPreferences: () => set({ sportIds: [] }),
    }),
    {
      name: 'sport-preferences',
    }
  )
);
