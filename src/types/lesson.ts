export interface TeacherAssignment {
  teacherId: string;
  teacherName: string;
  lessonCount: number;
}

export interface ClassSubjectLesson {
  classSubjectId: string;
  assignments: TeacherAssignment[];
}

export interface BulkLessonRequest {
  classSubjectId: string;
  assignments: {
    teacherId: string;
    lessonCount: number;
  }[];
}

export interface AssignmentRow {
  teacherId: string;
  lessonCount: number;
  isEditing: boolean;
}
