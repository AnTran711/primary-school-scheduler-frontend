import type {
  GridState,
  Period,
  Shift,
  TimetableConfig
} from '@/types/timetable';
import {
  ALL_DAYS,
  ALL_PERIODS,
  DAY_LABELS,
  getCellId,
  PERIOD_LABELS,
  SHIFT_LABELS
} from '@/utils/timetable.util';
import { Box, Typography } from '@mui/material';
import DroppableCell from './droppable-cell';

interface TimetableGridProps {
  schoolClassId: string;
  config: TimetableConfig;
  gridState: GridState;
  onTogglePin: (cardId: string) => void;
}

const CELL_W = 108;
const LABEL_W = 72;
const GAP = 4;

const TimetableGrid = ({
  schoolClassId,
  config,
  gridState,
  onTogglePin
}: TimetableGridProps) => {
  const days = ALL_DAYS.slice(0, config.numberOfDays);
  const morningPeriods = ALL_PERIODS.slice(0, config.morningPeriods);
  const afternoonPeriods = config.hasAfternoon
    ? ALL_PERIODS.slice(0, config.afternoonPeriods)
    : [];

  const gridTemplate = `${LABEL_W}px repeat(${days.length}, ${CELL_W}px)`;

  const renderShiftRows = (shift: Shift, periods: Period[]) => (
    <>
      {/* Shift label */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: gridTemplate,
          gap: `${GAP}px`,
          mb: `${GAP}px`,
          mt: shift === 'AFTERNOON' ? 1.5 : 0
        }}
      >
        <Box
          sx={{
            gridColumn: `1 / ${days.length + 2}`,
            py: 0.5,
            px: 1,
            bgcolor: shift === 'MORNING' ? '#fef9c3' : '#e0f2fe',
            borderRadius: 1,
            border: '1px solid',
            borderColor: shift === 'MORNING' ? '#fde68a' : '#bae6fd'
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: 'text.secondary' }}
          >
            {SHIFT_LABELS[shift]}
          </Typography>
        </Box>
      </Box>

      {/* Period rows */}
      {periods.map((period) => (
        <Box
          key={period}
          sx={{
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            gap: `${GAP}px`,
            mb: `${GAP}px`
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: 'text.secondary' }}
            >
              {PERIOD_LABELS[period]}
            </Typography>
          </Box>

          {days.map((day) => {
            const cellId = getCellId(schoolClassId, day, shift, period);
            const card = gridState[cellId] ?? null;
            return (
              <DroppableCell
                key={cellId}
                cellId={cellId}
                card={card}
                onTogglePin={onTogglePin}
              />
            );
          })}
        </Box>
      ))}
    </>
  );

  const minWidth = LABEL_W + days.length * CELL_W + days.length * GAP;

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box sx={{ minWidth }}>
        {/* Day headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            gap: `${GAP}px`,
            mb: 1
          }}
        >
          {days.map((day) => (
            <Box
              key={day}
              sx={{
                py: 0.75,
                textAlign: 'center',
                bgcolor: 'primary.main',
                borderRadius: 1
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: 'white' }}
              >
                {DAY_LABELS[day]}
              </Typography>
            </Box>
          ))}
        </Box>

        {renderShiftRows('MORNING', morningPeriods)}
        {config.hasAfternoon && renderShiftRows('AFTERNOON', afternoonPeriods)}
      </Box>
    </Box>
  );
};

export default TimetableGrid;
