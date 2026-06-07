import type { DragEndEvent } from '@dnd-kit/react';
import { toast } from 'react-toastify';
import type { GridState, LessonCardData } from '@/types/timetable';
import { checkHardConstraints, parseCellId } from '@/utils/timetable.util';

interface UseTimetableDndProps {
  gridState: GridState;
  setGridState: React.Dispatch<React.SetStateAction<GridState>>;
}

export const useTimetableDnd = ({
  gridState,
  setGridState
}: UseTimetableDndProps) => {
  const handleDragEnd = async (event: DragEndEvent) => {
    const source = event.operation.source;
    const target = event.operation.target;

    // Không có drop target → bỏ qua
    if (!target) return;

    const card = source?.data?.card as LessonCardData | undefined;
    if (!card) return;

    const targetCellId = target.id as string;
    const { classId } = parseCellId(targetCellId);

    // Chỉ cho drop vào đúng lớp
    if (classId !== card.schoolClassId) {
      toast.error('Không thể xếp tiết của lớp này vào lớp khác!');
      return;
    }

    // 1. Hard constraint check (client-side)
    const hardCheck = checkHardConstraints(gridState, card, targetCellId);
    if (!hardCheck.valid) {
      toast.error(hardCheck.message);
      return;
    }

    // 2. Cập nhật grid
    const newGrid: GridState = { ...gridState };
    const oldCell = Object.keys(newGrid).find(
      (k) => newGrid[k]?.id === card.id
    );
    if (oldCell) newGrid[oldCell] = null;
    newGrid[targetCellId] = card;
    setGridState(newGrid);
  };

  return { handleDragEnd };
};
