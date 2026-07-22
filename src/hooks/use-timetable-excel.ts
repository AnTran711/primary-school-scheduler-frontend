import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import type {
  DayOfWeek,
  GridState,
  Period,
  Shift,
  TimetableConfig
} from '@/types/timetable';
import {
  ALL_DAYS,
  ALL_PERIODS,
  DAY_LABELS,
  PERIOD_LABELS,
  SHIFT_LABELS,
  getCellId
} from '@/utils/timetable.util';
import type { SchoolClass } from '@/types/school-class';

interface UseTimetableExcelProps {
  schoolClasses: SchoolClass[];
  config: TimetableConfig;
  gridState: GridState;
}

/**
 * Kiểm tra có đang chạy trong Tauri hay không
 */
const isTauri = (): boolean => {
  return '__TAURI_INTERNALS__' in window;
};

/**
 * Lưu file Excel — dùng Tauri dialog "Save As" nếu chạy trong desktop app,
 * hoặc dùng browser download nếu chạy trên trình duyệt.
 * Trả về true nếu lưu thành công, false nếu người dùng huỷ dialog.
 */
const saveExcelFile = async (
  wb: XLSX.WorkBook,
  defaultFileName: string
): Promise<boolean> => {
  if (isTauri()) {
    // Tauri: dùng dialog "Save As" + plugin fs để ghi file
    const { save } = await import('@tauri-apps/plugin-dialog');
    const { writeFile } = await import('@tauri-apps/plugin-fs');

    const filePath = await save({
      title: 'Lưu file thời khoá biểu',
      defaultPath: defaultFileName,
      filters: [
        {
          name: 'Excel Files',
          extensions: ['xlsx']
        }
      ]
    });

    if (filePath) {
      // Tạo Uint8Array từ workbook
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      await writeFile(filePath, new Uint8Array(buffer));
      return true;
    }
    // Người dùng huỷ dialog
    return false;
  } else {
    // Trình duyệt: dùng XLSX.writeFile bình thường
    XLSX.writeFile(wb, defaultFileName);
    return true;
  }
};

/**
 * Tạo tên sheet hợp lệ cho Excel: thay ký tự đặc biệt, giới hạn 31 ký tự,
 * và đảm bảo không trùng tên.
 */
const sanitizeSheetName = (
  name: string,
  existingNames: Set<string>
): string => {
  let sheetName = name
    .replace(/[\\/?*[\]]/g, '-')
    .trim()
    .substring(0, 31);

  // Đảm bảo không trùng tên sheet
  if (existingNames.has(sheetName)) {
    let counter = 2;
    let candidate = sheetName.substring(0, 28) + `(${counter})`;
    while (existingNames.has(candidate)) {
      counter++;
      candidate = sheetName.substring(0, 28) + `(${counter})`;
    }
    sheetName = candidate;
  }

  existingNames.add(sheetName);
  return sheetName;
};

export const useTimetableExcel = ({
  schoolClasses,
  config,
  gridState
}: UseTimetableExcelProps) => {
  const handleExportExcel = async () => {
    try {
      const wb = XLSX.utils.book_new();
      const days = ALL_DAYS.slice(0, config.numberOfDays);
      const morningPeriods = ALL_PERIODS.slice(0, config.morningPeriods);
      const afternoonPeriods = config.hasAfternoon
        ? ALL_PERIODS.slice(0, config.afternoonPeriods)
        : [];
      const periodsPerDay = morningPeriods.length + afternoonPeriods.length;

      // ── Helpers ────────────────────────────────────────────────────────────────

      const getCellContent = (
        classId: string,
        day: DayOfWeek,
        shift: Shift,
        period: Period
      ): string => {
        const cellId = getCellId(classId, day, shift, period);
        const card = gridState[cellId];
        return card ? `${card.subjectName}(${card.teacherName})` : '';
      };

      // ── Sheet CHUNG ───────────────────────────────────────────────────────────

      const buildOverviewSheet = (): XLSX.WorkSheet => {
        const wsData: (string | number)[][] = [];
        const merges: XLSX.Range[] = [];

        // Nhóm lớp theo điểm trường, giữ nguyên thứ tự
        const branchGroups: { name: string; classes: SchoolClass[] }[] = [];
        const branchMap = new Map<string, number>();

        for (const sc of schoolClasses) {
          const idx = branchMap.get(sc.branchSchoolId);
          if (idx !== undefined) {
            branchGroups[idx].classes.push(sc);
          } else {
            branchMap.set(sc.branchSchoolId, branchGroups.length);
            branchGroups.push({ name: sc.branchSchoolName, classes: [sc] });
          }
        }

        // ── Header row 0: THỨ | TIẾT | [tên điểm trường merged] ──────────────
        const headerRow0: string[] = ['THỨ', 'TIẾT'];
        const headerRow1: string[] = ['', ''];

        let colIdx = 2;
        for (const group of branchGroups) {
          headerRow0.push(group.name);
          for (let i = 1; i < group.classes.length; i++) headerRow0.push('');

          if (group.classes.length > 1) {
            merges.push({
              s: { r: 0, c: colIdx },
              e: { r: 0, c: colIdx + group.classes.length - 1 }
            });
          }

          for (const sc of group.classes) headerRow1.push(sc.name);
          colIdx += group.classes.length;
        }

        wsData.push(headerRow0);
        wsData.push(headerRow1);

        // Merge THỨ (A0:A1) và TIẾT (B0:B1) header dọc 2 hàng
        merges.push({ s: { r: 0, c: 0 }, e: { r: 1, c: 0 } });
        merges.push({ s: { r: 0, c: 1 }, e: { r: 1, c: 1 } });

        // Danh sách lớp phẳng theo thứ tự nhóm
        const orderedClasses: SchoolClass[] = branchGroups.flatMap((g) => g.classes);

        // ── Data rows ─────────────────────────────────────────────────────────
        let rowIdx = 2;

        for (const day of days) {
          const dayStartRow = rowIdx;

          for (const period of morningPeriods) {
            const row: string[] = [
              rowIdx === dayStartRow ? DAY_LABELS[day] : '',
              PERIOD_LABELS[period]
            ];
            for (const sc of orderedClasses) {
              row.push(getCellContent(sc.id, day, 'MORNING', period));
            }
            wsData.push(row);
            rowIdx++;
          }

          for (const period of afternoonPeriods) {
            const row: string[] = [
              rowIdx === dayStartRow ? DAY_LABELS[day] : '',
              PERIOD_LABELS[period]
            ];
            for (const sc of orderedClasses) {
              row.push(getCellContent(sc.id, day, 'AFTERNOON', period));
            }
            wsData.push(row);
            rowIdx++;
          }

          // Merge cột THỨ dọc cho ngày này
          if (periodsPerDay > 1) {
            merges.push({
              s: { r: dayStartRow, c: 0 },
              e: { r: dayStartRow + periodsPerDay - 1, c: 0 }
            });
          }
        }

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!merges'] = merges;

        // Độ rộng cột
        ws['!cols'] = [
          { wch: 10 },
          { wch: 8 },
          ...orderedClasses.map(() => ({ wch: 20 }))
        ];

        return ws;
      };

      // ── Sheet từng lớp ────────────────────────────────────────────────────────

      const buildClassSheet = (sc: SchoolClass): XLSX.WorkSheet => {
        const wsData: (string | number)[][] = [];
        const merges: XLSX.Range[] = [];
        const totalCols = days.length + 2; // Buổi dạy + Tiết + ngày

        // Row 0: tiêu đề lớp (merge ngang)
        wsData.push([`THỜI KHOÁ BIỂU LỚP ${sc.name}`]);
        merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

        // Row 1: trống
        wsData.push([]);

        // Row 2: header bảng
        wsData.push([
          'Buổi dạy',
          'Tiết',
          ...days.map((d) => DAY_LABELS[d])
        ]);

        // Row 3+: buổi sáng
        let rowIdx = 3;
        const morningStartRow = rowIdx;

        for (const period of morningPeriods) {
          const row: string[] = [
            rowIdx === morningStartRow ? SHIFT_LABELS['MORNING'] : '',
            PERIOD_LABELS[period]
          ];
          for (const day of days) {
            row.push(getCellContent(sc.id, day, 'MORNING', period));
          }
          wsData.push(row);
          rowIdx++;
        }

        if (morningPeriods.length > 1) {
          merges.push({
            s: { r: morningStartRow, c: 0 },
            e: { r: morningStartRow + morningPeriods.length - 1, c: 0 }
          });
        }

        // Buổi chiều (nếu có)
        if (config.hasAfternoon && afternoonPeriods.length > 0) {
          const afternoonStartRow = rowIdx;

          for (const period of afternoonPeriods) {
            const row: string[] = [
              rowIdx === afternoonStartRow ? SHIFT_LABELS['AFTERNOON'] : '',
              PERIOD_LABELS[period]
            ];
            for (const day of days) {
              row.push(getCellContent(sc.id, day, 'AFTERNOON', period));
            }
            wsData.push(row);
            rowIdx++;
          }

          if (afternoonPeriods.length > 1) {
            merges.push({
              s: { r: afternoonStartRow, c: 0 },
              e: { r: afternoonStartRow + afternoonPeriods.length - 1, c: 0 }
            });
          }
        }

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!merges'] = merges;

        // Độ rộng cột
        ws['!cols'] = [
          { wch: 12 },
          { wch: 8 },
          ...days.map(() => ({ wch: 20 }))
        ];

        return ws;
      };

      // ── Sheet từng giáo viên ──────────────────────────────────────────────────

      /** Thông tin 1 tiết dạy của giáo viên */
      interface TeacherLesson {
        day: DayOfWeek;
        shift: Shift;
        period: Period;
        subjectName: string;
        className: string;
      }

      /**
       * Thu thập tất cả giáo viên và tiết dạy của họ từ gridState.
       * Trả về Map<teacherId, { teacherName, lessons[] }>
       */
      const collectTeacherLessons = (): Map<
        string,
        { teacherName: string; lessons: TeacherLesson[] }
      > => {
        const teacherMap = new Map<
          string,
          { teacherName: string; lessons: TeacherLesson[] }
        >();

        for (const [cellId, card] of Object.entries(gridState)) {
          if (!card) continue;

          const parts = cellId.split('__');
          if (parts.length !== 4) continue;

          const [, dayOfWeek, shift, period] = parts;

          if (!teacherMap.has(card.teacherId)) {
            teacherMap.set(card.teacherId, {
              teacherName: card.teacherName,
              lessons: []
            });
          }

          teacherMap.get(card.teacherId)!.lessons.push({
            day: dayOfWeek as DayOfWeek,
            shift: shift as Shift,
            period: period as Period,
            subjectName: card.subjectName,
            className: card.className
          });
        }

        // Sắp xếp tiết dạy theo thứ > buổi > tiết
        const dayOrder: Record<string, number> = {};
        ALL_DAYS.forEach((d, i) => (dayOrder[d] = i));
        const shiftOrder: Record<string, number> = {
          MORNING: 0,
          AFTERNOON: 1
        };
        const periodOrder: Record<string, number> = {};
        ALL_PERIODS.forEach((p, i) => (periodOrder[p] = i));

        for (const data of teacherMap.values()) {
          data.lessons.sort((a, b) => {
            const dDiff = dayOrder[a.day] - dayOrder[b.day];
            if (dDiff !== 0) return dDiff;
            const sDiff = shiftOrder[a.shift] - shiftOrder[b.shift];
            if (sDiff !== 0) return sDiff;
            return periodOrder[a.period] - periodOrder[b.period];
          });
        }

        return teacherMap;
      };

      /** Label ngắn cho buổi dạy */
      const SHIFT_SHORT_LABELS: Record<Shift, string> = {
        MORNING: 'Sáng',
        AFTERNOON: 'Chiều'
      };

      /** Label ngắn cho thứ (dùng trong sheet giáo viên) */
      const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
        MONDAY: 'Hai',
        TUESDAY: 'Ba',
        WEDNESDAY: 'Tư',
        THURSDAY: 'Năm',
        FRIDAY: 'Sáu',
        SATURDAY: 'Bảy'
      };

      /**
       * Xây dựng sheet TKB cho 1 giáo viên theo format file mẫu:
       * Row 0: Tên giáo viên (tiêu đề)
       * Row 1: trống
       * Row 2: Header bảng — Thứ | Buổi | Môn | Lớp | Tiết
       * Row 3+: Dữ liệu — merge cột Thứ và Buổi cho các tiết cùng ngày/buổi
       */
      const buildTeacherSheet = (
        teacherName: string,
        lessons: TeacherLesson[]
      ): XLSX.WorkSheet => {
        const wsData: (string | number)[][] = [];
        const merges: XLSX.Range[] = [];
        const totalCols = 5; // Thứ | Buổi | Môn | Lớp | Tiết

        // Row 0: Tên giáo viên
        wsData.push([teacherName]);
        merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

        // Row 1: trống
        wsData.push([]);

        // Row 2: Header
        wsData.push(['Thứ', 'Buổi', 'Môn', 'Lớp', 'Tiết']);

        // Row 3+: Dữ liệu
        let rowIdx = 3;

        // Nhóm theo (day, shift) để merge cột Thứ và Buổi
        let prevDay = '';
        let prevShift = '';
        let dayStartRow = rowIdx;
        let shiftStartRow = rowIdx;

        for (let i = 0; i < lessons.length; i++) {
          const lesson = lessons[i];
          const currentDay = lesson.day;
          const currentShift = lesson.shift;

          const isNewDay = currentDay !== prevDay;
          const isNewShift = currentDay !== prevDay || currentShift !== prevShift;

          // Khi chuyển sang ngày/buổi mới, merge các ô trước đó
          if (isNewDay && i > 0) {
            // Merge cột Thứ
            if (rowIdx - dayStartRow > 1) {
              merges.push({
                s: { r: dayStartRow, c: 0 },
                e: { r: rowIdx - 1, c: 0 }
              });
            }
            // Merge cột Buổi (cho shift cuối của ngày trước)
            if (rowIdx - shiftStartRow > 1) {
              merges.push({
                s: { r: shiftStartRow, c: 1 },
                e: { r: rowIdx - 1, c: 1 }
              });
            }
            dayStartRow = rowIdx;
            shiftStartRow = rowIdx;
          } else if (isNewShift && i > 0) {
            // Merge cột Buổi cho shift trước
            if (rowIdx - shiftStartRow > 1) {
              merges.push({
                s: { r: shiftStartRow, c: 1 },
                e: { r: rowIdx - 1, c: 1 }
              });
            }
            shiftStartRow = rowIdx;
          }

          const row: string[] = [
            isNewDay ? DAY_SHORT_LABELS[currentDay] : '',
            isNewShift ? SHIFT_SHORT_LABELS[currentShift] : '',
            lesson.subjectName,
            lesson.className,
            PERIOD_LABELS[lesson.period]
          ];

          wsData.push(row);
          prevDay = currentDay;
          prevShift = currentShift;
          rowIdx++;
        }

        // Merge cho nhóm cuối cùng
        if (lessons.length > 0) {
          if (rowIdx - dayStartRow > 1) {
            merges.push({
              s: { r: dayStartRow, c: 0 },
              e: { r: rowIdx - 1, c: 0 }
            });
          }
          if (rowIdx - shiftStartRow > 1) {
            merges.push({
              s: { r: shiftStartRow, c: 1 },
              e: { r: rowIdx - 1, c: 1 }
            });
          }
        }

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!merges'] = merges;

        // Độ rộng cột
        ws['!cols'] = [
          { wch: 8 },   // Thứ
          { wch: 10 },  // Buổi
          { wch: 20 },  // Môn
          { wch: 10 },  // Lớp
          { wch: 8 }    // Tiết
        ];

        return ws;
      };

      // ── Tạo workbook ──────────────────────────────────────────────────────────

      const usedSheetNames = new Set<string>();

      // Sheet CHUNG
      const overviewSheet = buildOverviewSheet();
      XLSX.utils.book_append_sheet(wb, overviewSheet, 'CHUNG');
      usedSheetNames.add('CHUNG');

      // Sheet từng lớp
      for (const sc of schoolClasses) {
        const classSheet = buildClassSheet(sc);
        const sheetName = sanitizeSheetName(sc.name, usedSheetNames);
        XLSX.utils.book_append_sheet(wb, classSheet, sheetName);
      }

      // Sheet từng giáo viên
      const teacherMap = collectTeacherLessons();

      // Sắp xếp giáo viên theo tên cho dễ tìm
      const sortedTeachers = Array.from(teacherMap.entries()).sort((a, b) =>
        a[1].teacherName.localeCompare(b[1].teacherName, 'vi')
      );

      for (const [, { teacherName, lessons }] of sortedTeachers) {
        const teacherSheet = buildTeacherSheet(teacherName, lessons);
        const sheetName = sanitizeSheetName(teacherName, usedSheetNames);
        XLSX.utils.book_append_sheet(wb, teacherSheet, sheetName);
      }

      // ── Lưu file ──────────────────────────────────────────────────────────────

      const saved = await saveExcelFile(wb, 'thoikhoabieu.xlsx');
      if (saved) {
        toast.success('Xuất file Excel thành công!');
      }
    } catch (error) {
      console.error('Lỗi khi xuất file Excel:', error);
      toast.error('Xuất file Excel thất bại. Vui lòng thử lại!');
    }
  };

  return { handleExportExcel };
};
