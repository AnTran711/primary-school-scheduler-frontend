import type {
  DayOfWeek,
  GridState,
  LessonCardData,
  LessonOverview,
  Period,
  Shift,
  TimeslotData,
  TimetableConfig
} from '@/types/timetable';

// ─── Constants ────────────────────────────────────────────────────────────────

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Thứ 2',
  TUESDAY: 'Thứ 3',
  WEDNESDAY: 'Thứ 4',
  THURSDAY: 'Thứ 5',
  FRIDAY: 'Thứ 6',
  SATURDAY: 'Thứ 7'
};

export const SHIFT_LABELS: Record<Shift, string> = {
  MORNING: 'Buổi sáng',
  AFTERNOON: 'Buổi chiều'
};

export const PERIOD_LABELS: Record<Period, string> = {
  FIRST: 'Tiết 1',
  SECOND: 'Tiết 2',
  THIRD: 'Tiết 3',
  FOURTH: 'Tiết 4',
  FIFTH: 'Tiết 5'
};

export const ALL_DAYS: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY'
];

export const ALL_PERIODS: Period[] = [
  'FIRST',
  'SECOND',
  'THIRD',
  'FOURTH',
  'FIFTH'
];

export const CARD_COLORS = [
  { bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8' },
  { bg: '#dcfce7', border: '#86efac', text: '#15803d' },
  { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
  { bg: '#fce7f3', border: '#f9a8d4', text: '#9d174d' },
  { bg: '#ede9fe', border: '#c4b5fd', text: '#6d28d9' },
  { bg: '#ffedd5', border: '#fdba74', text: '#9a3412' },
  { bg: '#cffafe', border: '#67e8f9', text: '#0e7490' },
  { bg: '#f0fdf4', border: '#6ee7b7', text: '#065f46' },
  { bg: '#fdf4ff', border: '#e879f9', text: '#86198f' },
  { bg: '#fff1f2', border: '#fda4af', text: '#9f1239' }
];

// ─── Timeslot generation ──────────────────────────────────────────────────────

export const generateTimeslots = (config: TimetableConfig): TimeslotData[] => {
  const days = ALL_DAYS.slice(0, config.numberOfDays);
  const morningPeriods = ALL_PERIODS.slice(0, config.morningPeriods);
  const afternoonPeriods = config.hasAfternoon
    ? ALL_PERIODS.slice(0, config.afternoonPeriods)
    : [];

  const timeslots: TimeslotData[] = [];
  for (const dayOfWeek of days) {
    for (const period of morningPeriods) {
      timeslots.push({ dayOfWeek, shift: 'MORNING', period });
    }
    for (const period of afternoonPeriods) {
      timeslots.push({ dayOfWeek, shift: 'AFTERNOON', period });
    }
  }
  return timeslots;
};

// ─── Cell ID helpers ──────────────────────────────────────────────────────────

export const getCellId = (
  classId: string,
  day: DayOfWeek,
  shift: Shift,
  period: Period
): string => `${classId}__${day}__${shift}__${period}`;

export const parseCellId = (cellId: string) => {
  const [classId, dayOfWeek, shift, period] = cellId.split('__');
  return {
    classId,
    dayOfWeek: dayOfWeek as DayOfWeek,
    shift: shift as Shift,
    period: period as Period
  };
};

// ─── Lesson card generation ───────────────────────────────────────────────────

export const generateLessonCards = (
  lessons: LessonOverview[]
): LessonCardData[] => {
  const colorMap = new Map<string, number>();
  let colorIdx = 0;

  return lessons.flatMap((lesson) => {
    if (!colorMap.has(lesson.classSubjectId)) {
      colorMap.set(lesson.classSubjectId, colorIdx % CARD_COLORS.length);
      colorIdx++;
    }
    const color = colorMap.get(lesson.classSubjectId)!;

    return Array.from({ length: lesson.lessonCount }, (_, i) => ({
      id: `${lesson.classSubjectId}-${lesson.teacherId}-${i}`,
      classSubjectId: lesson.classSubjectId,
      subjectName: lesson.subjectName,
      schoolClassId: lesson.schoolClassId,
      className: lesson.className,
      teacherId: lesson.teacherId,
      teacherName: lesson.teacherName,
      isPinned: false,
      colorIndex: color
    }));
  });
};

// ─── Hard constraint check (client-side) ─────────────────────────────────────

export const checkHardConstraints = (
  gridState: GridState,
  draggedCard: LessonCardData,
  targetCellId: string
): { valid: boolean; message?: string } => {
  const { dayOfWeek, shift, period } = parseCellId(targetCellId);

  // 1. Ô đã có thẻ khác
  const existing = gridState[targetCellId];
  if (existing && existing.id !== draggedCard.id) {
    return {
      valid: false,
      message: `Ô này đã có tiết ${existing.subjectName} (${existing.teacherName})`
    };
  }

  // 2. Cùng giáo viên, cùng timeslot, khác lớp
  const conflict = Object.entries(gridState).find(([cellId, card]) => {
    if (!card || card.id === draggedCard.id) return false;
    const parsed = parseCellId(cellId);
    return (
      parsed.dayOfWeek === dayOfWeek &&
      parsed.shift === shift &&
      parsed.period === period &&
      card.teacherId === draggedCard.teacherId
    );
  });

  if (conflict) {
    const [, conflictCard] = conflict;
    return {
      valid: false,
      message: `${draggedCard.teacherName} đang dạy lớp ${conflictCard?.className} vào thời điểm này`
    };
  }

  return { valid: true };
};

// ─── Extract pinned items ─────────────────────────────────────────────────────

export const extractPinnedItems = (gridState: GridState) =>
  Object.entries(gridState)
    .filter(([, card]) => card?.isPinned)
    .map(([cellId, card]) => {
      const { dayOfWeek, shift, period } = parseCellId(cellId);
      return {
        classSubjectId: card!.classSubjectId,
        teacherId: card!.teacherId,
        timeslot: { dayOfWeek, shift, period }
      };
    });

// ─── Get unplaced cards for a class ──────────────────────────────────────────

export const getUnplacedCards = (
  allCards: LessonCardData[],
  gridState: GridState,
  schoolClassId: string
): LessonCardData[] => {
  const placedIds = new Set(
    Object.values(gridState)
      .filter(Boolean)
      .map((c) => c!.id)
  );
  return allCards.filter(
    (c) => c.schoolClassId === schoolClassId && !placedIds.has(c.id)
  );
};
