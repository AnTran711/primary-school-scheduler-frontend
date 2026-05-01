import type { SchoolClass, SchoolClassStore } from '@/types/school-class';
import { create } from 'zustand';

export const useSchoolClassStore = create<SchoolClassStore>((set) => ({
  schoolClasses: [],
  setSchoolClasses: (schoolClasses: SchoolClass[]) => set({ schoolClasses })
}));
