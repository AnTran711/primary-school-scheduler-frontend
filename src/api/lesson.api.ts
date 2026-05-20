import type { BulkLessonRequest } from '@/types/lesson';
import api from './axios-client';
import type { ApiResponse } from '@/types/api-response';

export const fetchLessonByClassSubjectAPI = async (classSubjectId: string) => {
  const res = await api.get(`/lessons?classSubjectId=${classSubjectId}`);

  return res;
};

export const saveLessonAssignmentAPI = async (data: BulkLessonRequest) => {
  const res: ApiResponse<string> = await api.post('/lessons', data);

  return res;
};
