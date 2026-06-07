import { Box, Typography } from '@mui/material';
import { CheckCircleOutlined } from '@mui/icons-material';
import type { GridState, LessonCardData } from '@/types/timetable';
import { getUnplacedCards } from '@/utils/timetable.util';
import LessonCard from './lesson-card';

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

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}
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
          TIẾT CHƯA XẾP
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
