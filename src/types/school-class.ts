export interface SchoolClass {
  id: string;
  name: string;
  branchSchoolId: string;
  branchSchoolName: string;
  homeroomTeacherId: string;
  homeroomTeacherName: string;
}

export interface SchoolClassStore {
  schoolClasses: SchoolClass[];
  setSchoolClasses: (schoolClasses: SchoolClass[]) => void;
}
