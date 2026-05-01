export interface Subject {
  id: string;
  name: string;
}

export interface SubjectStore {
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
}
