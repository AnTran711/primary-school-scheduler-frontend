import type { ApiResponse } from '@/types/api-response';
import api from './axios-client';
import type { ClassSubject, ClassSubjectRequest } from '@/types/class-subject';

export const fetchClassSubjectsByClassAPI = async (classId: string) => {
  const res = await api.get(`/class-subjects?schoolClassId=${classId}`);

  return res;
};

export const createClassSubjectAPI = async (data: ClassSubjectRequest) => {
  const res: ApiResponse<ClassSubject> = await api.post(
    '/class-subjects',
    data
  );
  return res;
};

export const updateClassSubjectAPI = async (
  id: string,
  data: Partial<ClassSubjectRequest>
) => {
  const res: ApiResponse<ClassSubject> = await api.put(
    `/class-subjects/${id}`,
    data
  );
  return res;
};

export const deleteClassSubjectAPI = async (id: string) => {
  const res: ApiResponse<string> = await api.delete(`/class-subjects/${id}`);
  return res;
};
