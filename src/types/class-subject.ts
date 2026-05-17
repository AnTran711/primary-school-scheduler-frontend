export interface ClassSubject {
  id: string;
  lessonsPerWeek: number;
  schoolClassId: string;
  schoolClassName: string;
  subjectId: string;
  subjectName: string;
}

export interface ClassSubjectRequest {
  lessonsPerWeek: number;
  schoolClassId: string;
  subjectId: string;
}
