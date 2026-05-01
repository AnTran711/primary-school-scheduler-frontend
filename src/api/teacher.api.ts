import { useTeacherStore } from '@/stores/teacher-store';
import api from './axios-client';

export const createTeacherAPI = async (teacherData: {
  name: string;
  numberOfLessonsPerWeek: number;
}) => {
  const res = await api.post('/teachers', teacherData);

  const newTeacher = res.data;

  const currentTeachers = useTeacherStore.getState().teachers;
  currentTeachers.push(newTeacher);

  useTeacherStore.getState().setTeachers(currentTeachers);
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
  const res = await api.put(`/teachers/${teacherId}`, updateData);

  const updatedTeacher = res.data;

  const currentTeachers = useTeacherStore.getState().teachers;
  const updatedTeachers = currentTeachers.map((teacher) =>
    teacher.id === teacherId ? updatedTeacher : teacher
  );

  useTeacherStore.getState().setTeachers(updatedTeachers);
};

export const deleteTeacherAPI = async (teacherId: string) => {
  await api.delete(`/teachers/${teacherId}`);

  const currentTeachers = useTeacherStore.getState().teachers;
  const updatedTeachers = currentTeachers.filter(
    (teacher) => teacher.id !== teacherId
  );
  useTeacherStore.getState().setTeachers(updatedTeachers);
};
