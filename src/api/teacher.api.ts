import { useTeacherStore } from '@/stores/teacher-store';
import api from './axios-client';
import type { ApiResponse } from '@/types/api-response';
import type { Teacher } from '@/types/teacher';

export const createTeacherAPI = async (teacherData: {
  name: string;
  numberOfLessonsPerWeek: number;
}) => {
  const res: ApiResponse<Teacher> = await api.post('/teachers', teacherData);

  return res;
};

export const fetchTeachersAPI = async () => {
  const res = await api.get('/teachers');
  const teachers = res.data;

  useTeacherStore.getState().setTeachers(teachers);
};

export const updateTeacherAPI = async (
  teacherId: string,
  updateData: {
    name: string;
    numberOfLessonsPerWeek: number;
  }
) => {
  const res: ApiResponse<Teacher> = await api.put(
    `/teachers/${teacherId}`,
    updateData
  );

  return res;
};

export const deleteTeacherAPI = async (teacherId: string) => {
  const res: ApiResponse<string> = await api.delete(`/teachers/${teacherId}`);

  return res;
};

// ─── Teacher Availability (dùng cho dropdown ở trang LessonPage — loại trừ classSubject hiện tại) ─
export const fetchTeacherAvailabilityAPI = async (classSubjectId: string) => {
  const res = await api.get(
    `/teachers/availability?classSubjectId=${classSubjectId}`
  );

  return res;
};

// ─── Teacher Workload (dùng cho dialog ở trang LessonPage — toàn bộ tiết đã phân công) ───────────
export const fetchTeacherWorkloadAPI = async () => {
  const res = await api.get('/teachers/workload');

  return res;
};
