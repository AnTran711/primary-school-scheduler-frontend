import { Box, Typography } from '@mui/material';
import { CheckCircleOutlined, InboxOutlined } from '@mui/icons-material';
import type { GridState, LessonCardData } from '@/types/timetable';
import { getUnplacedCards } from '@/utils/timetable.util';
import LessonCard from './lesson-card';
import { useDroppable } from '@dnd-kit/react';

// Id prefix để nhận biết drop target là UnplacedCardsPanel
export const UNPLACED_PANEL_ID_PREFIX = 'unplaced__';
const getUnplacePanelId = (schoolClassId: string) => {
  return `${UNPLACED_PANEL_ID_PREFIX}${schoolClassId}`;
};

interface UnplacedCardsPanelProps {
  schoolClassId: string;
  allCards: LessonCardData[];
  gridState: GridState;
  onTogglePin: (cardId: string) => void;
}

const UnplacedCardsPanel = ({
  schoolClassId,
  allCards,
  gridState,
  onTogglePin
}: UnplacedCardsPanelProps) => {
  const unplaced = getUnplacedCards(allCards, gridState, schoolClassId);
  const total = allCards.filter(
    (c) => c.schoolClassId === schoolClassId
  ).length;
  const placed = total - unplaced.length;

  // Toàn bộ panel là 1 droptable
  const { ref, isDropTarget } = useDroppable({
    id: getUnplacePanelId(schoolClassId)
  });

  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        height: '100%',
        borderRadius: 2,
        border: '2px solid',
        // Highlight khi đang kéo thẻ vào panel
        borderColor: isDropTarget ? 'warning.main' : 'transparent',
        bgcolor: isDropTarget ? 'warning.50' : 'transparent',
        transition: 'all 150ms',
        p: isDropTarget ? 0.5 : 0
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: 'text.secondary' }}
        >
          TIẾT ĐÃ XẾP
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: placed === total ? 'success.main' : 'text.secondary'
          }}
        >
          {placed}/{total}
        </Typography>
      </Box>

      {/* Drop hint khi đang kéo */}
      {isDropTarget && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            py: 0.75,
            borderRadius: 1.5,
            border: '2px dashed',
            borderColor: 'warning.main',
            bgcolor: 'warning.50'
          }}
        >
          <InboxOutlined sx={{ fontSize: 14, color: 'warning.main' }} />
          <Typography
            variant="caption"
            sx={{ color: 'warning.main', fontWeight: 600 }}
          >
            Thả để bỏ xếp
          </Typography>
        </Box>
      )}

      {/* Cards */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75
        }}
      >
        {unplaced.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              py: 4,
              color: 'success.main'
            }}
          >
            <CheckCircleOutlined />
            <Typography
              variant="caption"
              sx={{ color: 'success.main', textAlign: 'center' }}
            >
              Tất cả đã được xếp
            </Typography>
          </Box>
        ) : (
          unplaced.map((card) => (
            <LessonCard key={card.id} card={card} onTogglePin={onTogglePin} />
          ))
        )}
      </Box>
    </Box>
  );
};

export default UnplacedCardsPanel;
