export interface SchoolClass {
  id: string;
  name: string;
  branchSchoolId: string;
  branchSchoolName: string;
  homerommTeacherId: string;
  homeroomTeacherName: string;
}

export interface SchoolClassStore {
  schoolClasses: SchoolClass[];
  setSchoolClasses: (schoolClasses: SchoolClass[]) => void;
}
