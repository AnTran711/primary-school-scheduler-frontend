import { Chip } from '@mui/material';
import {
  CheckCircleOutlined,
  RadioButtonUncheckedOutlined,
  WarningAmberOutlined
} from '@mui/icons-material';

interface AssignmentStatusBadgeProps {
  assignedLessons: number;
  totalLessons: number;
}

const AssignmentStatusBadge = ({
  assignedLessons,
  totalLessons
}: AssignmentStatusBadgeProps) => {
  if (assignedLessons === 0) {
    return (
      <Chip
        icon={<RadioButtonUncheckedOutlined sx={{ fontSize: 13 }} />}
        label="Chưa phân công"
        size="small"
        sx={{ bgcolor: 'grey.100', color: 'text.disabled', fontSize: 11 }}
      />
    );
  }

  if (assignedLessons < totalLessons) {
    return (
      <Chip
        icon={<WarningAmberOutlined sx={{ fontSize: 13 }} />}
        label={`${assignedLessons}/${totalLessons} tiết`}
        size="small"
        color="warning"
        variant="outlined"
        sx={{ fontSize: 11 }}
      />
    );
  }

  return (
    <Chip
      icon={<CheckCircleOutlined sx={{ fontSize: 13 }} />}
      label={`${assignedLessons}/${totalLessons} tiết`}
      size="small"
      color="success"
      variant="outlined"
      sx={{ fontSize: 11 }}
    />
  );
};

export default AssignmentStatusBadge;
