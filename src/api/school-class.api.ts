import { useSchoolClassStore } from '@/stores/school-class-store';
import api from './axios-client';
import type { ApiResponse } from '@/types/api-response';
import type { SchoolClass } from '@/types/school-class';

export const createSchoolClassAPI = async (schoolClassData: {
  name: string;
  branchSchoolId: string;
  homeroomTeacherId: string;
}) => {
  const res: ApiResponse<SchoolClass> = await api.post(
    '/classes',
    schoolClassData
  );

  return res;
};

export const fetchSchoolClassesAPI = async () => {
  const res = await api.get('/classes');
  const schoolClasses = res.data;

  useSchoolClassStore.getState().setSchoolClasses(schoolClasses);
};

export const updateSchoolClassAPI = async (
  schoolClassId: string,
  updateData: {
    name: string;
    branchSchoolId: string;
    homeroomTeacherId: string;
  }
) => {
  const res: ApiResponse<SchoolClass> = await api.put(
    `/classes/${schoolClassId}`,
    updateData
  );

  return res;
};

export const deleteSchoolClassAPI = async (schoolClassId: string) => {
  const res: ApiResponse<string> = await api.delete(
    `/classes/${schoolClassId}`
  );

  return res;
};
