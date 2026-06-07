import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import type {
  DayOfWeek,
  GridState,
  Period,
  Shift,
  TimetableConfig
} from '@/types/timetable';
import { ALL_DAYS, ALL_PERIODS, getCellId } from '@/utils/timetable.util';
import type { SchoolClass } from '@/types/school-class';

interface UseTimetableExcelProps {
  schoolClasses: SchoolClass[];
  config: TimetableConfig;
  gridState: GridState;
}

export const useTimetableExcel = ({
  schoolClasses,
  config,
  gridState
}: UseTimetableExcelProps) => {
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const days = ALL_DAYS.slice(0, config.numberOfDays);
    const morningPeriods = ALL_PERIODS.slice(0, config.morningPeriods);
    const afternoonPeriods = config.hasAfternoon
      ? ALL_PERIODS.slice(0, config.afternoonPeriods)
      : [];

    const wsData: (string | number)[][] = [];

    const renderBlock = (sc: SchoolClass, shift: Shift, periods: Period[]) => {
      for (const period of periods) {
        const row: string[] = [period];
        for (const day of days) {
          const cellId = getCellId(sc.id, day as DayOfWeek, shift, period);
          const card = gridState[cellId];
          row.push(card ? `${card.subjectName} - ${card.teacherName}` : '');
        }
        wsData.push(row);
      }
    };

    for (const sc of schoolClasses) {
      // Header lớp
      wsData.push([`LỚP ${sc.name}`]);
      wsData.push(['', ...days]);

      // Buổi sáng
      wsData.push(['BUỔI SÁNG']);
      renderBlock(sc, 'MORNING', morningPeriods);

      // Buổi chiều (nếu có)
      if (config.hasAfternoon) {
        wsData.push(['BUỔI CHIỀU']);
        renderBlock(sc, 'AFTERNOON', afternoonPeriods);
      }

      // 2 dòng trống phân cách giữa các lớp
      wsData.push([], []);
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Căn độ rộng cột tự động
    const colWidths = Array(days.length + 1).fill({ wch: 25 });
    colWidths[0] = { wch: 12 };
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Thời khóa biểu');
    XLSX.writeFile(wb, 'thoikhoabieu.xlsx');
    toast.success('Xuất file Excel thành công!');
  };

  return { handleExportExcel };
};
