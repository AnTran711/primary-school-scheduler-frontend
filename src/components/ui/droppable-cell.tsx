import type { LessonCardData } from '@/types/timetable';
import { useDroppable } from '@dnd-kit/react';
import { Box, Typography } from '@mui/material';
import LessonCard from './lesson-card';

interface DroppableCellProps {
  cellId: string;
  card: LessonCardData | null;
  onTogglePin: (cardId: string) => void;
}

const DroppableCell = ({ cellId, card, onTogglePin }: DroppableCellProps) => {
  const { ref, isDropTarget } = useDroppable({ id: cellId });

  return (
    <Box
      ref={ref}
      sx={{
        minHeight: 60,
        border: '1px solid',
        borderColor: isDropTarget ? 'primary.main' : 'divider',
        borderRadius: 1,
        p: 0.5,
        bgcolor: isDropTarget ? 'primary.50' : 'background.paper',
        transition: 'all 120ms',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {card ? (
        <LessonCard card={card} onTogglePin={onTogglePin} compact />
      ) : (
        isDropTarget && (
          <Box
            sx={{
              flex: 1,
              borderRadius: 1,
              border: '2px dashed',
              borderColor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 40
            }}
          >
            <Typography variant="caption" sx={{ color: 'primary.main' }}>
              Thả vào đây
            </Typography>
          </Box>
        )
      )}
    </Box>
  );
};

export default DroppableCell;
