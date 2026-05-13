import { useBranchSchoolStore } from '@/stores/branch-school-store';
import api from './axios-client';
import type { ApiResponse } from '@/types/api-response';
import type { BranchSchool } from '@/types/branch-school';

export const createBranchSchoolAPI = async (branchSchoolData: {
  name: string;
}) => {
  const res: ApiResponse<BranchSchool> = await api.post(
    '/branch-schools',
    branchSchoolData
  );

  return res;
};

export const fetchBranchSchoolsAPI = async () => {
  const res = await api.get('/branch-schools');
  const branchSchools = res.data;

  useBranchSchoolStore.getState().setBranchSchools(branchSchools);
};

export const updateBranchSchoolAPI = async (
  branchSchoolId: string,
  updateData: {
    name: string;
  }
) => {
  const res: ApiResponse<BranchSchool> = await api.put(
    `/branch-schools/${branchSchoolId}`,
    updateData
  );

  return res;
};

export const deleteBranchSchoolAPI = async (branchSchoolId: string) => {
  const res: ApiResponse<string> = await api.delete(
    `/branch-schools/${branchSchoolId}`
  );

  return res;
};
