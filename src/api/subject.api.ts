import { useSubjectStore } from '@/stores/subject-store';
import api from './axios-client';
import type { ApiResponse } from '@/types/api-response';
import type { Subject } from '@/types/subject';

export const createSubjectAPI = async (subjectData: { name: string }) => {
  const res: ApiResponse<Subject> = await api.post('/subjects', subjectData);

  return res;
};

export const fetchSubjectsAPI = async () => {
  const res = await api.get('/subjects');
  const subjects = res.data;

  useSubjectStore.getState().setSubjects(subjects);
};

export const updateSubjectAPI = async (
  subjectId: string,
  updateData: {
    name: string;
  }
) => {
  const res: ApiResponse<Subject> = await api.put(
    `/subjects/${subjectId}`,
    updateData
  );

  return res;
};

export const deleteSubjectAPI = async (subjectId: string) => {
  const res: ApiResponse<string> = await api.delete(`/subjects/${subjectId}`);

  return res;
};
