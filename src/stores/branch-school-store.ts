import type { BranchSchool, BranchSchoolStore } from '@/types/branch-school';
import { create } from 'zustand';

export const useBranchSchoolStore = create<BranchSchoolStore>((set) => ({
  branchSchools: [],
  setBranchSchools: (branchSchools: BranchSchool[]) => set({ branchSchools })
}));
