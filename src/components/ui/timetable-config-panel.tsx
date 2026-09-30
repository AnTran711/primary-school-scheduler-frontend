import { useCallback, useMemo } from 'react';
import {
  Box,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import { CloseOutlined, TuneOutlined } from '@mui/icons-material';
import type { DayOfWeek, Period, Shift, TimetableConfig } from '@/types/timetable';
import {
  ALL_DAYS,
  ALL_PERIODS,
  DAY_LABELS,
  PERIOD_LABELS,
  SHIFT_LABELS,
  getTimeslotKey
} from '@/utils/timetable.util';

interface TimetableConfigPanelProps {
  config: TimetableConfig;
  onChange: (config: TimetableConfig) => void;
  isSolving: boolean;
  open: boolean;
  onClose: () => void;
}

const TimetableConfigPanel = ({
  config,
  onChange,
  isSolving,
  open,
  onClose
}: TimetableConfigPanelProps) => {
  const update = (partial: Partial<TimetableConfig>) =>
    onChange({ ...config, ...partial });

  const totalPeriodsPerDay =
    config.morningPeriods + (config.hasAfternoon ? config.afternoonPeriods : 0);

  // ── Derived timeslot data ──────────────────────────────────────────────────
  const days = useMemo(() => ALL_DAYS.slice(0, config.numberOfDays), [config.numberOfDays]);
  const morningPeriods = useMemo(() => ALL_PERIODS.slice(0, config.morningPeriods), [config.morningPeriods]);
  const afternoonPeriods = useMemo(
    () => (config.hasAfternoon ? ALL_PERIODS.slice(0, config.afternoonPeriods) : []),
    [config.hasAfternoon, config.afternoonPeriods]
  );

  const excludedSet = useMemo(() => new Set(config.excludedTimeslots), [config.excludedTimeslots]);

  // Khi config thay đổi (giảm ngày/tiết), tự động dọn các excluded key không còn hợp lệ
  const cleanExcluded = useCallback(
    (nextExcluded: string[], nextDays: DayOfWeek[], nextMorning: Period[], nextAfternoon: Period[]) => {
      const validKeys = new Set<string>();
      for (const d of nextDays) {
        for (const p of nextMorning) validKeys.add(getTimeslotKey(d, 'MORNING', p));
        for (const p of nextAfternoon) validKeys.add(getTimeslotKey(d, 'AFTERNOON', p));
      }
      return nextExcluded.filter((k) => validKeys.has(k));
    },
    []
  );

  // ── Toggle single timeslot ────────────────────────────────────────────────
  const toggleTimeslot = useCallback(
    (day: DayOfWeek, shift: Shift, period: Period) => {
      const key = getTimeslotKey(day, shift, period);
      const next = excludedSet.has(key)
        ? config.excludedTimeslots.filter((k) => k !== key)
        : [...config.excludedTimeslots, key];
      update({ excludedTimeslots: next });
    },
    [config.excludedTimeslots, excludedSet] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Toggle entire day (column) ─────────────────────────────────────────────
  const toggleDay = useCallback(
    (day: DayOfWeek) => {
      const keysForDay: string[] = [];
      for (const p of morningPeriods) keysForDay.push(getTimeslotKey(day, 'MORNING', p));
      for (const p of afternoonPeriods) keysForDay.push(getTimeslotKey(day, 'AFTERNOON', p));

      const allExcluded = keysForDay.every((k) => excludedSet.has(k));

      let next: string[];
      if (allExcluded) {
        // Bỏ exclude tất cả timeslot trong ngày này
        const keysSet = new Set(keysForDay);
        next = config.excludedTimeslots.filter((k) => !keysSet.has(k));
      } else {
        // Exclude tất cả timeslot trong ngày này
        const existing = new Set(config.excludedTimeslots);
        next = [...config.excludedTimeslots, ...keysForDay.filter((k) => !existing.has(k))];
      }
      update({ excludedTimeslots: next });
    },
    [config.excludedTimeslots, excludedSet, morningPeriods, afternoonPeriods] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Toggle entire shift row ────────────────────────────────────────────────
  const toggleShiftRow = useCallback(
    (shift: Shift, period: Period) => {
      const keysForRow: string[] = [];
      for (const d of days) keysForRow.push(getTimeslotKey(d, shift, period));

      const allExcluded = keysForRow.every((k) => excludedSet.has(k));

      let next: string[];
      if (allExcluded) {
        const keysSet = new Set(keysForRow);
        next = config.excludedTimeslots.filter((k) => !keysSet.has(k));
      } else {
        const existing = new Set(config.excludedTimeslots);
        next = [...config.excludedTimeslots, ...keysForRow.filter((k) => !existing.has(k))];
      }
      update({ excludedTimeslots: next });
    },
    [config.excludedTimeslots, excludedSet, days] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Count excluded ────────────────────────────────────────────────────────
  const totalSlots = days.length * totalPeriodsPerDay;
  const excludedCount = config.excludedTimeslots.length;
  const activeSlots = totalSlots - excludedCount;

  // ── Config change wrappers (clean excluded on resize) ──────────────────────
  const handleDaysChange = (_: unknown, v: number | null) => {
    if (v === null) return;
    const nextDays = ALL_DAYS.slice(0, v);
    const cleaned = cleanExcluded(config.excludedTimeslots, nextDays, morningPeriods, afternoonPeriods);
    update({ numberOfDays: v, excludedTimeslots: cleaned });
  };

  const handleMorningPeriodsChange = (_: unknown, v: number | number[]) => {
    const val = v as number;
    const nextMorning = ALL_PERIODS.slice(0, val);
    const cleaned = cleanExcluded(config.excludedTimeslots, days, nextMorning, afternoonPeriods);
    update({ morningPeriods: val, excludedTimeslots: cleaned });
  };

  const handleAfternoonToggle = (checked: boolean) => {
    const nextAfternoon = checked ? ALL_PERIODS.slice(0, config.afternoonPeriods) : [];
    const cleaned = cleanExcluded(config.excludedTimeslots, days, morningPeriods, nextAfternoon);
    update({ hasAfternoon: checked, excludedTimeslots: cleaned });
  };

  const handleAfternoonPeriodsChange = (_: unknown, v: number | number[]) => {
    const val = v as number;
    const nextAfternoon = ALL_PERIODS.slice(0, val);
    const cleaned = cleanExcluded(config.excludedTimeslots, days, morningPeriods, nextAfternoon);
    update({ afternoonPeriods: val, excludedTimeslots: cleaned });
  };

  // ── Render exclusion grid ──────────────────────────────────────────────────
  const renderExclusionGrid = (shift: Shift, periods: Period[]) => {
    if (periods.length === 0) return null;

    return (
      <Box sx={{ mb: 1 }}>
        {/* Shift label */}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: shift === 'MORNING' ? '#92400e' : '#0e7490',
            mb: 0.5,
            display: 'block'
          }}
        >
          {SHIFT_LABELS[shift]}
        </Typography>

        {periods.map((period) => (
          <Box
            key={`${shift}-${period}`}
            sx={{
              display: 'grid',
              gridTemplateColumns: `56px repeat(${days.length}, 1fr)`,
              gap: '3px',
              mb: '3px'
            }}
          >
            {/* Period label — click to toggle entire row */}
            <Tooltip title={`Bật/tắt tất cả ${PERIOD_LABELS[period]}`} arrow placement="left">
              <Box
                onClick={() => !isSolving && toggleShiftRow(shift, period)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100',
                  borderRadius: 0.75,
                  cursor: isSolving ? 'default' : 'pointer',
                  userSelect: 'none',
                  '&:hover': isSolving ? {} : { bgcolor: 'grey.200' }
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'text.secondary' }}>
                  {PERIOD_LABELS[period]}
                </Typography>
              </Box>
            </Tooltip>

            {/* Day cells */}
            {days.map((day) => {
              const key = getTimeslotKey(day, shift, period);
              const isExcluded = excludedSet.has(key);

              return (
                <Tooltip
                  key={key}
                  title={isExcluded ? 'Nhấn để cho phép xếp tiết' : 'Nhấn để bỏ tiết này'}
                  arrow
                >
                  <Box
                    onClick={() => !isSolving && toggleTimeslot(day, shift, period)}
                    sx={{
                      height: 28,
                      borderRadius: 0.75,
                      cursor: isSolving ? 'default' : 'pointer',
                      transition: 'all 150ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none',
                      ...(isExcluded
                        ? {
                          bgcolor: '#fee2e2',
                          border: '1.5px solid #fca5a5',
                          // Gạch chéo bằng CSS gradient
                          backgroundImage:
                            'repeating-linear-gradient(135deg, transparent, transparent 3px, #fca5a570 3px, #fca5a570 4px)',
                          '&:hover': isSolving
                            ? {}
                            : {
                              bgcolor: '#fecaca',
                              borderColor: '#f87171',
                              transform: 'scale(1.05)'
                            }
                        }
                        : {
                          bgcolor: '#dcfce7',
                          border: '1.5px solid #86efac',
                          '&:hover': isSolving
                            ? {}
                            : {
                              bgcolor: '#bbf7d0',
                              borderColor: '#4ade80',
                              transform: 'scale(1.05)'
                            }
                        })
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: isExcluded ? '#dc2626' : '#16a34a'
                      }}
                    >
                      {isExcluded ? '✕' : '✓'}
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneOutlined fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
            Cấu hình khung thời khóa biểu
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Số ngày */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            Số ngày học
          </Typography>
          <ToggleButtonGroup
            value={config.numberOfDays}
            exclusive
            onChange={handleDaysChange}
            disabled={isSolving}
            fullWidth
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                py: 0.75,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'primary.dark' }
                }
              }
            }}
          >
            <ToggleButton value={5}>5 ngày (T2 – T6)</ToggleButton>
            <ToggleButton value={6}>6 ngày (T2 – T7)</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Buổi sáng */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Tiết buổi sáng
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              {config.morningPeriods} tiết
            </Typography>
          </Box>
          <Slider
            value={config.morningPeriods}
            min={1}
            max={5}
            step={1}
            marks
            onChange={handleMorningPeriodsChange}
            disabled={isSolving}
            size="small"
          />
        </Box>

        {/* Buổi chiều */}
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={config.hasAfternoon}
              onChange={(e) => handleAfternoonToggle(e.target.checked)}
              disabled={isSolving}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Có học buổi chiều
            </Typography>
          }
          sx={{ mb: 1, ml: 0 }}
        />

        {config.hasAfternoon && (
          <Box sx={{ mb: 2, pl: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 0.5
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Tiết buổi chiều
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: 'primary.main' }}
              >
                {config.afternoonPeriods} tiết
              </Typography>
            </Box>
            <Slider
              value={config.afternoonPeriods}
              min={1}
              max={5}
              step={1}
              marks
              onChange={handleAfternoonPeriodsChange}
              disabled={isSolving}
              size="small"
            />
          </Box>
        )}

        {/* Summary */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'divider',
            mb: 2.5
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {config.numberOfDays} ngày × {totalPeriodsPerDay} tiết ={' '}
            <strong>{totalSlots} tiết/tuần</strong>
            {excludedCount > 0 && (
              <>
                {' '}− {excludedCount} tiết nghỉ ={' '}
                <strong style={{ color: '#16a34a' }}>{activeSlots} tiết khả dụng</strong>
              </>
            )}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ── Exclusion Grid ──────────────────────────────────────────── */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Chọn tiết nghỉ
            </Typography>
            {excludedCount > 0 && (
              <Chip
                label={`${excludedCount} tiết nghỉ`}
                size="small"
                color="error"
                variant="outlined"
                onDelete={() => update({ excludedTimeslots: [] })}
                sx={{ height: 24, fontSize: '0.75rem' }}
              />
            )}
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}>
            Nhấn vào ô để bật/tắt. Nhấn vào tên tiết hoặc tên thứ để bật/tắt cả hàng/cột.
          </Typography>

          {/* Day headers */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `56px repeat(${days.length}, 1fr)`,
              gap: '3px',
              mb: '3px'
            }}
          >
            <Box /> {/* Placeholder cho góc trái */}
            {days.map((day) => {
              // Check if all timeslots in this day are excluded
              const shifts: Shift[] = ['MORNING', ...(config.hasAfternoon ? (['AFTERNOON'] as Shift[]) : [])];
              const keysForDay = shifts.flatMap((s) =>
                (s === 'MORNING' ? morningPeriods : afternoonPeriods).map((p) => getTimeslotKey(day, s, p))
              );
              const allDayExcluded = keysForDay.length > 0 && keysForDay.every((k) => excludedSet.has(k));

              return (
                <Tooltip key={day} title={`Bật/tắt tất cả ${DAY_LABELS[day]}`} arrow>
                  <Box
                    onClick={() => !isSolving && toggleDay(day)}
                    sx={{
                      py: 0.5,
                      textAlign: 'center',
                      bgcolor: allDayExcluded ? '#fef2f2' : 'primary.main',
                      borderRadius: 0.75,
                      cursor: isSolving ? 'default' : 'pointer',
                      transition: 'all 150ms',
                      userSelect: 'none',
                      '&:hover': isSolving
                        ? {}
                        : {
                          opacity: 0.85,
                          transform: 'scale(1.03)'
                        }
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        color: allDayExcluded ? '#dc2626' : 'white'
                      }}
                    >
                      {DAY_LABELS[day]}
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>

          {/* Morning grid */}
          {renderExclusionGrid('MORNING', morningPeriods)}

          {/* Afternoon grid */}
          {config.hasAfternoon && renderExclusionGrid('AFTERNOON', afternoonPeriods)}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TimetableConfigPanel;
