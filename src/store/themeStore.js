import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const applyTheme = (isDark) => {
  document.documentElement.classList.toggle('dark', isDark);
};

const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,
      toggleTheme: () => {
        const next = !get().isDark;
        set({ isDark: next });
        applyTheme(next);
      },
    }),
    {
      name: 'gradewise-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.isDark);
      },
    }
  )
);

export default useThemeStore;
