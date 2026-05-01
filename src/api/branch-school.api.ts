import { useBranchSchoolStore } from '@/stores/branch-school-store';
import api from './axios-client';

export const createBranchSchoolAPI = async (branchSchoolData: {
  name: string;
}) => {
  const res = await api.post('/branch-schools', branchSchoolData);

  const newBranchSchool = res.data;

  const currentBranchSchools = useBranchSchoolStore.getState().branchSchools;
  currentBranchSchools.push(newBranchSchool);

  useBranchSchoolStore.getState().setBranchSchools(currentBranchSchools);
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
  const res = await api.put(`/branch-schools/${branchSchoolId}`, updateData);

  const updatedBranchSchool = res.data;

  const currentBranchSchools = useBranchSchoolStore.getState().branchSchools;
  const updatedBranchSchools = currentBranchSchools.map((branchSchool) =>
    branchSchool.id === branchSchoolId ? updatedBranchSchool : branchSchool
  );

  useBranchSchoolStore.getState().setBranchSchools(updatedBranchSchools);
};

export const deleteBranchSchoolAPI = async (branchSchoolId: string) => {
  await api.delete(`/branch-schools/${branchSchoolId}`);

  const currentBranchSchools = useBranchSchoolStore.getState().branchSchools;
  const updatedBranchSchools = currentBranchSchools.filter(
    (branchSchool) => branchSchool.id !== branchSchoolId
  );
  useBranchSchoolStore.getState().setBranchSchools(updatedBranchSchools);
};
