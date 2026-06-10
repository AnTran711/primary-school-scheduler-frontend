import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  GridState,
  LessonCardData,
  TimetableConfig
} from '@/types/timetable';

// ─── Default config ───────────────────────────────────────────────────────────

export const DEFAULT_CONFIG: TimetableConfig = {
  numberOfDays: 5,
  morningPeriods: 5,
  hasAfternoon: false,
  afternoonPeriods: 3
};

// ─── Store interface ──────────────────────────────────────────────────────────

interface TimetableState {
  // State
  config: TimetableConfig;
  allCards: LessonCardData[];
  gridState: GridState;
  hasSolution: boolean;

  // Actions
  setConfig: (config: TimetableConfig) => void;
  setAllCards: (cards: LessonCardData[]) => void;
  setGridState: (grid: GridState) => void;
  updateGridState: (updater: (prev: GridState) => GridState) => void;
  setHasSolution: (v: boolean) => void;
  togglePin: (cardId: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTimetableStore = create<TimetableState>()(
  persist(
    (set, get) => ({
      // ── Initial State ─────────────────────────────────────────────────
      config: DEFAULT_CONFIG,
      allCards: [],
      gridState: {},
      hasSolution: false,

      // ── Actions ────────────────────────────────────────────────────────

      setConfig: (config) => set({ config }),

      setAllCards: (cards) => set({ allCards: cards }),

      setGridState: (gridState) => set({ gridState }),

      updateGridState: (updater) =>
        set((state) => ({ gridState: updater(state.gridState) })),

      setHasSolution: (hasSolution) => set({ hasSolution }),

      togglePin: (cardId) => {
        const { allCards, gridState } = get();

        // Toggle trong allCards
        const nextCards = allCards.map((c) =>
          c.id === cardId ? { ...c, isPinned: !c.isPinned } : c
        );

        // Toggle trong gridState
        const nextGrid = { ...gridState };
        for (const [k, v] of Object.entries(nextGrid)) {
          if (v?.id === cardId) nextGrid[k] = { ...v, isPinned: !v.isPinned };
        }

        set({ allCards: nextCards, gridState: nextGrid });
      }
    }),
    {
      name: 'timetable-config-storage',
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist config vào localStorage
      partialize: (state) => ({
        config: state.config
      })
    }
  )
);
