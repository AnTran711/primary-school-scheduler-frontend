export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY';

export type Shift = 'MORNING' | 'AFTERNOON';

export type Period = 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'FIFTH';

// ─── Config ───────────────────────────────────────────────────────────────────

export interface TimetableConfig {
  numberOfDays: number;
  morningPeriods: number;
  hasAfternoon: boolean;
  afternoonPeriods: number;
}

// ─── Timeslot ─────────────────────────────────────────────────────────────────

export interface TimeslotData {
  dayOfWeek: DayOfWeek;
  shift: Shift;
  period: Period;
}

// ─── Lesson card (1 thẻ = 1 tiết) ────────────────────────────────────────────

export interface LessonCardData {
  id: string;
  classSubjectId: string;
  subjectName: string;
  schoolClassId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  isPinned: boolean;
  colorIndex: number;
}

// ─── Lesson từ API ────────────────────────────────────────────────────────────

export interface LessonOverview {
  id: string;
  classSubjectId: string;
  subjectName: string;
  schoolClassId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  lessonCount: number;
}

// ─── Grid: key = `${classId}__${day}__${shift}__${period}` ───────────────────

export type GridState = Record<string, LessonCardData | null>;

// ─── API request / response ───────────────────────────────────────────────────

export interface PinnedItem {
  classSubjectId: string;
  teacherId: string;
  timeslot: TimeslotData;
}

export interface CreateTimetableRequest {
  timeslots: TimeslotData[];
  pinnedItems: PinnedItem[];
}

export interface LessonTimetableResponse {
  id: string;
  classSubjectId: string;
  subjectName: string;
  schoolClassId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: DayOfWeek | null;
  shift: Shift | null;
  period: Period | null;
  isPinned: boolean;
}

export interface TimetableResponse {
  lessons: LessonTimetableResponse[];
  score: string;
}
