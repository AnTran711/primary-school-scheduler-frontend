import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { PushPin, PushPinOutlined } from '@mui/icons-material';
import type { LessonCardData } from '@/types/timetable';
import { CARD_COLORS } from '@/utils/timetable.util';
import { useDraggable } from '@dnd-kit/react';

interface LessonCardProps {
  card: LessonCardData;
  onTogglePin?: (cardId: string) => void;
  compact?: boolean;
}

const LessonCard = ({
  card,
  onTogglePin,
  compact = false
}: LessonCardProps) => {
  const { ref, isDragging } = useDraggable({
    id: card.id,
    data: { card }, // truyền data để DragEndEvent đọc được,
    disabled: card.isPinned
  });

  const color = CARD_COLORS[card.colorIndex];

  return (
    <Box
      ref={ref}
      sx={{
        bgcolor: color.bg,
        border: '1.5px solid',
        borderColor: color.border,
        borderRadius: 1.5,
        px: compact ? 0.75 : 1.25,
        py: compact ? 0.5 : 0.75,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 0.5,
        opacity: isDragging ? 0.4 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 999 : 'auto',
        userSelect: 'none',
        minWidth: 0,
        width: '100%'
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          noWrap
          sx={{
            fontWeight: 700,
            color: color.text,
            fontSize: compact ? 10 : 11,
            display: 'block'
          }}
        >
          {card.subjectName}
        </Typography>
        <Typography
          variant="caption"
          noWrap
          sx={{
            opacity: 0.75,
            fontSize: compact ? 9 : 10,
            color: color.text,
            display: 'block'
          }}
        >
          {card.teacherName}
        </Typography>
      </Box>

      {onTogglePin && (
        <Tooltip title={card.isPinned ? 'Bỏ ghim' : 'Ghim tiết này'}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(card.id);
            }}
            sx={{
              p: 0.25,
              flexShrink: 0,
              color: card.isPinned ? color.text : `${color.text}60`,
              '&:hover': { color: color.text }
            }}
          >
            {card.isPinned ? (
              <PushPin sx={{ fontSize: 13 }} />
            ) : (
              <PushPinOutlined sx={{ fontSize: 13 }} />
            )}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default LessonCard;
