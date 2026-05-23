export interface TeacherAvailability {
  teacherId: string;
  teacherName: string;
  numberOfLessonsPerWeek: number;
  assignedLessons: number; // tổng tiết đã phân công (không tính classSubject hiện tại)
}

export interface TeacherWorkload {
  teacherId: string;
  teacherName: string;
  numberOfLessonsPerWeek: number;
  assignedLessons: number; // tổng tiết đã phân công toàn trường
}

export interface AssignmentRow {
  teacherId: string;
  lessonCount: number;
}

export interface ClassSubjectLesson {
  classSubjectId: string;
  assignments: AssignmentRow[];
}

export interface BulkLessonRequest {
  classSubjectId: string;
  assignments: AssignmentRow[];
}
