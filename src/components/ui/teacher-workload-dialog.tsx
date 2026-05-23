import { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import type { TeacherWorkload } from '@/types/lesson';
import { fetchTeacherWorkloadAPI } from '@/api/teacher.api';

interface TeacherWorkloadDialogProps {
  open: boolean;
  onClose: () => void;
}

const TeacherWorkloadDialog = ({
  open,
  onClose
}: TeacherWorkloadDialogProps) => {
  const [workloads, setWorkloads] = useState<TeacherWorkload[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchTeacherWorkloadAPI();
        setWorkloads(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      {/* Header */}
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Tình trạng phân công giáo viên
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.25, color: 'text.secondary' }}
            >
              Tổng số tiết đã phân công trên toàn trường
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {workloads.map((w) => {
              const isFull = w.assignedLessons >= w.numberOfLessonsPerWeek;
              const remaining = w.numberOfLessonsPerWeek - w.assignedLessons;

              return (
                <Box
                  key={w.teacherId}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: isFull ? 'success.50' : 'warning.50'
                  }}
                >
                  {/* Tên giáo viên */}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {w.teacherName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {isFull
                        ? 'Đã phân công đủ tiết'
                        : `Còn ${remaining} tiết chưa phân công`}
                    </Typography>
                  </Box>

                  {/* Badge tiết */}
                  <Chip
                    label={`${w.assignedLessons}/${w.numberOfLessonsPerWeek} tiết`}
                    size="small"
                    color={isFull ? 'success' : 'warning'}
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: 12 }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TeacherWorkloadDialog;
