import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Slider,
  Typography
} from '@mui/material';
import { TuneOutlined } from '@mui/icons-material';
import type { TimetableConfig } from '@/types/timetable';

interface TimetableConfigPanelProps {
  config: TimetableConfig;
  onChange: (config: TimetableConfig) => void;
  onSolve: () => void;
  onReSolve: () => void;
  isSolving: boolean;
  hasSolution: boolean;
}

const TimetableConfigPanel = ({
  config,
  onChange,
  onSolve,
  onReSolve,
  isSolving,
  hasSolution
}: TimetableConfigPanelProps) => {
  const update = (partial: Partial<TimetableConfig>) =>
    onChange({ ...config, ...partial });

  const totalPeriodsPerDay =
    config.morningPeriods + (config.hasAfternoon ? config.afternoonPeriods : 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TuneOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: 'text.secondary' }}
        >
          CẤU HÌNH KHUNG
        </Typography>
      </Box>

      {/* Số ngày */}
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Số ngày học
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            {config.numberOfDays === 5 ? 'T2 – T6' : 'T2 – T7'}
          </Typography>
        </Box>
        <Slider
          value={config.numberOfDays}
          min={5}
          max={6}
          step={1}
          marks={[
            { value: 5, label: '5 ngày' },
            { value: 6, label: '6 ngày' }
          ]}
          onChange={(_, v) => update({ numberOfDays: v as number })}
          disabled={isSolving}
          size="small"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Buổi sáng */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
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
            sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}
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
          borderColor: 'divider',
          mb: 2
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {config.numberOfDays} ngày × {totalPeriodsPerDay} tiết ={' '}
          <strong>{config.numberOfDays * totalPeriodsPerDay} tiết/tuần</strong>
        </Typography>
      </Box>

      {/* Buttons */}
      {!hasSolution ? (
        <Button
          fullWidth
          variant="contained"
          onClick={onSolve}
          disabled={isSolving}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {isSolving ? 'Đang xếp lịch...' : 'Tạo thời khóa biểu'}
        </Button>
      ) : (
        <Button
          fullWidth
          variant="outlined"
          onClick={onReSolve}
          disabled={isSolving}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {isSolving ? 'Đang xếp lại...' : 'Xếp lại thời khóa biểu'}
        </Button>
      )}
    </Box>
  );
};

export default TimetableConfigPanel;
