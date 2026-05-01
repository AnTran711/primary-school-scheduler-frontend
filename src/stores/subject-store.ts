import type { Subject, SubjectStore } from '@/types/subject';
import { create } from 'zustand';

export const useSubjectStore = create<SubjectStore>((set) => ({
  subjects: [],
  setSubjects: (subjects: Subject[]) => set({ subjects })
}));
