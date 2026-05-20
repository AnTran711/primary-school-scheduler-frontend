import {
  CheckCircleOutlined,
  RadioButtonUncheckedOutlined,
  WarningAmberOutlined
} from '@mui/icons-material';
import { Chip } from '@mui/material';

const AssignmentStatusBadge = ({
  assigned,
  total
}: {
  assigned: number;
  total: number;
}) => {
  if (assigned === 0)
    return (
      <Chip
        icon={<RadioButtonUncheckedOutlined sx={{ fontSize: 14 }} />}
        label="Chưa phân công"
        size="small"
        sx={{ bgcolor: 'grey.100', color: 'text.disabled', fontSize: 11 }}
      />
    );

  if (assigned < total)
    return (
      <Chip
        icon={<WarningAmberOutlined sx={{ fontSize: 14 }} />}
        label={`${assigned}/${total} tiết`}
        size="small"
        color="warning"
        variant="outlined"
        sx={{ fontSize: 11 }}
      />
    );

  return (
    <Chip
      icon={<CheckCircleOutlined sx={{ fontSize: 14 }} />}
      label={`${assigned}/${total} tiết`}
      size="small"
      color="success"
      variant="outlined"
      sx={{ fontSize: 11 }}
    />
  );
};

export default AssignmentStatusBadge;
