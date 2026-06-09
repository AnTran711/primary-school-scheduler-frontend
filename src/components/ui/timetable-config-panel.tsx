import {
  Box,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { CloseOutlined, TuneOutlined } from '@mui/icons-material';
import type { TimetableConfig } from '@/types/timetable';

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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
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
            onChange={(_, v) => { if (v !== null) update({ numberOfDays: v }); }}
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
            onChange={(_, v) => update({ morningPeriods: v as number })}
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
              onChange={(e) => update({ hasAfternoon: e.target.checked })}
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
              onChange={(_, v) => update({ afternoonPeriods: v as number })}
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
            borderColor: 'divider'
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {config.numberOfDays} ngày × {totalPeriodsPerDay} tiết ={' '}
            <strong>{config.numberOfDays * totalPeriodsPerDay} tiết/tuần</strong>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TimetableConfigPanel;
