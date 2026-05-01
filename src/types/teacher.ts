export interface Teacher {
  id: string;
  name: string;
  numberOfLessonsPerWeek: number;
}

export interface TeacherStore {
  teachers: Teacher[];
  setTeachers: (teachers: Teacher[]) => void;
}
