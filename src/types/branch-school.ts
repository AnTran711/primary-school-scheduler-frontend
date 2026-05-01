export interface BranchSchool {
  id: string;
  name: string;
}

export interface BranchSchoolStore {
  branchSchools: BranchSchool[];
  setBranchSchools: (branchSchools: BranchSchool[]) => void;
}
