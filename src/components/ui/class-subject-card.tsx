import type { ClassSubject } from '@/types/class-subject';
import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Paper,
  Tooltip,
  Typography
} from '@mui/material';

export interface ClassSubjectCardProps {
  classSubject: ClassSubject;
  onEdit: (cs: ClassSubject) => void;
  onDelete: (cs: ClassSubject) => void;
}

const ClassSubjectCard = ({
  classSubject,
  onEdit,
  onDelete
}: ClassSubjectCardProps) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: 2.5,
      p: 2.5,
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      transition: 'box-shadow 150ms',
      '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }
    }}
  >
    {/* Icon + tên môn */}
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: 'primary.50',
          flexShrink: 0
        }}
      >
        <BookOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Tooltip title={classSubject.subjectName} placement="top">
          <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>
            {classSubject.subjectName}
          </Typography>
        </Tooltip>
        <Chip
          label={`${classSubject.lessonsPerWeek} tiết / tuần`}
          size="small"
          sx={{ mt: 0.5, fontSize: 11, fontWeight: 600, bgcolor: 'grey.100' }}
        />
      </Box>
    </Box>

    <Divider />

    {/* Actions */}
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
      <Tooltip title="Chỉnh sửa số tiết">
        <IconButton
          size="small"
          color="primary"
          onClick={() => onEdit(classSubject)}
        >
          <EditOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Xóa khỏi lớp">
        <IconButton
          size="small"
          color="error"
          onClick={() => onDelete(classSubject)}
        >
          <DeleteOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  </Paper>
);

export default ClassSubjectCard;
