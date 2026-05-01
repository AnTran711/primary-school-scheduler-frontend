import type { Teacher, TeacherStore } from '@/types/teacher';
import { create } from 'zustand';

export const useTeacherStore = create<TeacherStore>((set) => ({
  teachers: [],
  setTeachers: (teachers: Teacher[]) => set({ teachers })
}));
