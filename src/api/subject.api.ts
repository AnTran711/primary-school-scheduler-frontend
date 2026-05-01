import { useSubjectStore } from '@/stores/subject-store';
import api from './axios-client';

export const createSubjectAPI = async (subjectData: { name: string }) => {
  const res = await api.post('/subjects', subjectData);

  const newSubject = res.data;

  const currentSubjects = useSubjectStore.getState().subjects;
  currentSubjects.push(newSubject);

  useSubjectStore.getState().setSubjects(currentSubjects);
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
  const res = await api.put(`/subjects/${subjectId}`, updateData);

  const updatedSubject = res.data;

  const currentSubjects = useSubjectStore.getState().subjects;
  const updatedSubjects = currentSubjects.map((subject) =>
    subject.id === subjectId ? updatedSubject : subject
  );

  useSubjectStore.getState().setSubjects(updatedSubjects);
};

export const deleteSubjectAPI = async (subjectId: string) => {
  await api.delete(`/subjects/${subjectId}`);

  const currentSubjects = useSubjectStore.getState().subjects;
  const updatedSubjects = currentSubjects.filter(
    (subject) => subject.id !== subjectId
  );
  useSubjectStore.getState().setSubjects(updatedSubjects);
};
