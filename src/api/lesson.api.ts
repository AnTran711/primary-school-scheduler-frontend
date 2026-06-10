import type { BulkLessonRequest } from '@/types/lesson';
import api from './axios-client';
import type { ApiResponse } from '@/types/api-response';

// Sử dụng cho trang Lesson
export const fetchLessonsByClassSubjectAPI = async (classSubjectId: string) => {
  const res = await api.get(
    `/lessons/assignment?classSubjectId=${classSubjectId}`
  );

  return res;
};

// Lấy lesson overview của tất cả lớp, sử dụng cho trang Timetable
export const fetchLessonsOverviewAPI = async () => {
  const res = await api.get('/lessons/overview');

  return res;
};

export const saveLessonAssignmentAPI = async (data: BulkLessonRequest) => {
  const res: ApiResponse<string> = await api.post('/lessons', data);

  return res;
};
