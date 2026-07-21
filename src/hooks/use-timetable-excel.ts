import * as XLSX from 'xlsx';
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
 */
const saveExcelFile = async (wb: XLSX.WorkBook, defaultFileName: string) => {
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
    }
  } else {
    // Trình duyệt: dùng XLSX.writeFile bình thường
    XLSX.writeFile(wb, defaultFileName);
  }
};

export const useTimetableExcel = ({
  schoolClasses,
  config,
  gridState
}: UseTimetableExcelProps) => {
  const handleExportExcel = async () => {
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

    // ── Tạo workbook ──────────────────────────────────────────────────────────

    // Sheet CHUNG
    const overviewSheet = buildOverviewSheet();
    XLSX.utils.book_append_sheet(wb, overviewSheet, 'CHUNG');

    // Sheet từng lớp
    for (const sc of schoolClasses) {
      const classSheet = buildClassSheet(sc);
      // Thay ký tự không hợp lệ trong tên sheet Excel (\ / ? * [ ]) bằng "-"
      // và giới hạn 31 ký tự
      const sheetName = sc.name
        .replace(/[\\/?*[\]]/g, '-')
        .trim()
        .substring(0, 31);
      XLSX.utils.book_append_sheet(wb, classSheet, sheetName);
    }

    await saveExcelFile(wb, 'thoikhoabieu.xlsx');
  };

  return { handleExportExcel };
};
