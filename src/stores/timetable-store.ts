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
  classCardsMap: Record<string, LessonCardData[]>; // key = schoolClassId
  loadedClassIds: Set<string>; // track đã load những lớp nào
  gridState: GridState;
  hasSolution: boolean;

  // Actions
  setConfig: (config: TimetableConfig) => void;
  setClassCards: (classId: string, cards: LessonCardData[]) => void;
  setClassCardsMap: (map: Record<string, LessonCardData[]>) => void;
  getCardsForClass: (classId: string) => LessonCardData[];
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
      classCardsMap: {},
      loadedClassIds: new Set<string>(),
      gridState: {},
      hasSolution: false,

      // ── Actions ────────────────────────────────────────────────────────

      setConfig: (config) => set({ config }),

      setClassCards: (classId, cards) =>
        set((state) => ({
          classCardsMap: { ...state.classCardsMap, [classId]: cards },
          loadedClassIds: new Set([...state.loadedClassIds, classId])
        })),

      setClassCardsMap: (map) =>
        set({
          classCardsMap: map,
          loadedClassIds: new Set(Object.keys(map))
        }),

      getCardsForClass: (classId) => get().classCardsMap[classId] ?? [],

      setGridState: (gridState) => set({ gridState }),

      updateGridState: (updater) =>
        set((state) => ({ gridState: updater(state.gridState) })),

      setHasSolution: (hasSolution) => set({ hasSolution }),

      togglePin: (cardId) => {
        const { classCardsMap, gridState } = get();

        // Toggle trong classCardsMap
        const nextCardsMap = { ...classCardsMap };
        for (const [classId, cards] of Object.entries(nextCardsMap)) {
          const idx = cards.findIndex((c) => c.id === cardId);
          if (idx !== -1) {
            nextCardsMap[classId] = cards.map((c) =>
              c.id === cardId ? { ...c, isPinned: !c.isPinned } : c
            );
            break;
          }
        }

        // Toggle trong gridState
        const nextGrid = { ...gridState };
        for (const [k, v] of Object.entries(nextGrid)) {
          if (v?.id === cardId) nextGrid[k] = { ...v, isPinned: !v.isPinned };
        }

        set({ classCardsMap: nextCardsMap, gridState: nextGrid });
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
