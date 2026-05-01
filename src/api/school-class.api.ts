import { useSchoolClassStore } from '@/stores/school-class-store';
import api from './axios-client';

export const createSchoolClassAPI = async (schoolClassData: {
  name: string;
  branchSchoolId: string;
  homeroomTeacherId: string;
}) => {
  const res = await api.post('/classes', schoolClassData);

  const newSchoolClass = res.data;

  const currentSchoolClasses = useSchoolClassStore.getState().schoolClasses;
  currentSchoolClasses.push(newSchoolClass);

  useSchoolClassStore.getState().setSchoolClasses(currentSchoolClasses);
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
  const res = await api.put(`/classes/${schoolClassId}`, updateData);

  const updatedSchoolClass = res.data;

  const currentSchoolClasses = useSchoolClassStore.getState().schoolClasses;
  const updatedSchoolClasses = currentSchoolClasses.map((schoolClass) =>
    schoolClass.id === schoolClassId ? updatedSchoolClass : schoolClass
  );

  useSchoolClassStore.getState().setSchoolClasses(updatedSchoolClasses);
};

export const deleteSchoolClassAPI = async (schoolClassId: string) => {
  await api.delete(`/classes/${schoolClassId}`);

  const currentSchoolClasses = useSchoolClassStore.getState().schoolClasses;
  const updatedSchoolClasses = currentSchoolClasses.filter(
    (schoolClass) => schoolClass.id !== schoolClassId
  );
  useSchoolClassStore.getState().setSchoolClasses(updatedSchoolClasses);
};
