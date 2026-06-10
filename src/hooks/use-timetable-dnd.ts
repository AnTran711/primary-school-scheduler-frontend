import type { DragEndEvent } from '@dnd-kit/react';
import { toast } from 'react-toastify';
import type { GridState, LessonCardData } from '@/types/timetable';
import { checkHardConstraints, parseCellId } from '@/utils/timetable.util';
import { UNPLACED_PANEL_ID_PREFIX } from '@/components/ui/unplaced-cards-panel';

interface UseTimetableDndProps {
  gridState: GridState;
  setGridState: (grid: GridState) => void;
  updateGridState: (updater: (prev: GridState) => GridState) => void;
}

export const useTimetableDnd = ({
  gridState,
  setGridState,
  updateGridState
}: UseTimetableDndProps) => {
  const handleDragEnd = async (event: DragEndEvent) => {
    const source = event.operation.source;
    const target = event.operation.target;

    // Không có drop target → bỏ qua
    if (!target) return;

    const card = source?.data?.card as LessonCardData | undefined;
    if (!card) return;

    const targetId = target.id as string;

    // Case 1: Thả vào UnplacedCardsPanel -> xóa khỏi grid
    if (targetId.startsWith(UNPLACED_PANEL_ID_PREFIX)) {
      const panelClassId = targetId.replace(UNPLACED_PANEL_ID_PREFIX, '');

      // Chỉ cho drop vào panel của đúng lớp
      if (panelClassId !== card.schoolClassId) {
        toast.error('Không thể chuyển tiết sang lớp khác');
        return;
      }

      updateGridState((prev) => {
        const next = { ...prev };
        const oldCell = Object.keys(next).find((k) => next[k]?.id === card.id);
        if (oldCell) next[oldCell] = null;
        return next;
      });

      return; // Không cần check constraint
    }

    // Case 2: Thả vào cell bình thường -> kiểm tra ràng buộc cứng rồi cập nhật grid
    const targetCellId = targetId;
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
