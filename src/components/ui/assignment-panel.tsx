import {
  fetchLessonByClassSubjectAPI,
  saveLessonAssignmentAPI
} from '@/api/lesson.api';
import { useTeacherStore } from '@/stores/teacher-store';
import type { ClassSubject } from '@/types/class-subject';
import type { AssignmentRow, TeacherAssignment } from '@/types/lesson';
import {
  AddOutlined,
  ArrowBackOutlined,
  DeleteOutlined,
  SaveOutlined
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface AssignmentPanelProps {
  classSubject: ClassSubject;
  onBack: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getTotalAssigned = (rows: AssignmentRow[]) =>
  rows.reduce((sum, r) => sum + (Number(r.lessonCount) || 0), 0);

// ─── Components ───────────────────────────────────────────────────────────

const AssignmentPanel = ({ classSubject, onBack }: AssignmentPanelProps) => {
  const teachers = useTeacherStore((state) => state.teachers);

  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load phân công hiện có
  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const res = await fetchLessonByClassSubjectAPI(classSubject.id);
        if (res.data) {
          setRows(
            res.data.assignments.map((a: TeacherAssignment) => ({
              teacherId: a.teacherId,
              lessonCount: a.lessonCount,
              isEditing: false
            }))
          );
        } else {
          setRows([]);
        }
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [classSubject.id]);

  const totalAssigned = getTotalAssigned(rows);
  const remaining = classSubject.lessonsPerWeek - totalAssigned;
  const isComplete = totalAssigned === classSubject.lessonsPerWeek;
  const isOver = totalAssigned > classSubject.lessonsPerWeek;

  // Danh sách giáo viên chưa được chọn trong các row khác
  const getAvailableTeachers = (currentTeacherId: string) =>
    teachers.filter(
      (t) =>
        t.id === currentTeacherId || !rows.some((r) => r.teacherId === t.id)
    );

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { teacherId: '', lessonCount: 1, isEditing: true }
    ]);
  };

  const handleRemoveRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChangeTeacher = (idx: number, teacherId: string) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, teacherId } : r))
    );
  };

  const handleChangeLessonCount = (idx: number, value: string) => {
    setRows((prev) =>
      prev.map((r, i) =>
        i === idx ? { ...r, lessonCount: Number(value) || 0 } : r
      )
    );
  };

  const handleSave = async () => {
    // Validate
    if (!isComplete) {
      toast.error(
        remaining > 0
          ? `Còn thiếu ${remaining} tiết chưa được phân công`
          : `Vượt quá ${Math.abs(remaining)} tiết, vui lòng điều chỉnh`
      );
      return;
    }
    if (rows.some((r) => !r.teacherId)) {
      toast.error('Vui lòng chọn giáo viên cho tất cả các dòng');
      return;
    }

    try {
      setSaving(true);
      const res = await saveLessonAssignmentAPI({
        classSubjectId: classSubject.id,
        assignments: rows.map((r) => ({
          teacherId: r.teacherId,
          lessonCount: r.lessonCount
        }))
      });

      toast.success(res.message);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Tooltip title="Quay lại">
          <IconButton size="small" onClick={onBack}>
            <ArrowBackOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {classSubject.subjectName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {classSubject.lessonsPerWeek} tiết/tuần
          </Typography>
        </Box>
      </Box>

      {/* Bảng phân công */}
      <Paper
        variant="outlined"
        sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}
      >
        {/* Table header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 48px',
            gap: 2,
            px: 2,
            py: 1.25,
            bgcolor: 'grey.50',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: 'uppercase', fontWeight: 600 }}
          >
            Giáo viên
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textTransform: 'uppercase',
              fontWeight: 600,
              textAlign: 'center'
            }}
          >
            Số tiết
          </Typography>
        </Box>

        {/* Rows */}
        {rows.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.disabled">
              Chưa có giáo viên nào được phân công
            </Typography>
          </Box>
        ) : (
          rows.map((row, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 48px',
                gap: 2,
                px: 2,
                py: 1.25,
                alignItems: 'center',
                borderBottom: idx < rows.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider'
              }}
            >
              {/* Teacher select */}
              <TextField
                select
                size="small"
                value={row.teacherId}
                onChange={(
                  e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
                ) => handleChangeTeacher(idx, e.target.value)}
                placeholder="Chọn giáo viên"
              >
                {getAvailableTeachers(row.teacherId).map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Lesson count input */}
              <TextField
                size="small"
                type="number"
                value={row.lessonCount}
                onChange={(
                  e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
                ) => handleChangeLessonCount(idx, e.target.value)}
                slotProps={{
                  htmlInput: {
                    min: 1,
                    max: classSubject.lessonsPerWeek,
                    style: { textAlign: 'center' }
                  }
                }}
              />

              {/* Delete */}
              <Tooltip title="Xóa">
                <IconButton
                  size="small"
                  onClick={() => handleRemoveRow(idx)}
                  sx={{
                    color: 'text.disabled',
                    '&:hover': { color: 'error.main' }
                  }}
                >
                  <DeleteOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))
        )}

        {/* Footer tổng tiết */}
        <Divider />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 48px',
            gap: 2,
            px: 2,
            py: 1.25,
            bgcolor: isOver
              ? 'error.50'
              : isComplete
                ? 'success.50'
                : 'grey.50',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            Tổng
          </Typography>
          <Typography
            variant="body2"
            color={
              isOver
                ? 'error.main'
                : isComplete
                  ? 'success.main'
                  : 'text.primary'
            }
            sx={{ fontWeight: 600, textAlign: 'center' }}
          >
            {totalAssigned}/{classSubject.lessonsPerWeek}
            {isOver && ' (vượt quá)'}
            {!isOver && !isComplete && remaining > 0 && ` (còn ${remaining})`}
          </Typography>
          <Box />
        </Box>
      </Paper>

      {/* Actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Button
          variant="outlined"
          startIcon={<AddOutlined />}
          onClick={handleAddRow}
          disabled={rows.length >= teachers.length || saving}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Thêm giáo viên
        </Button>

        <Button
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={handleSave}
          disabled={saving || rows.length === 0}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          {saving ? 'Đang lưu...' : 'Lưu phân công'}
        </Button>
      </Box>
    </Box>
  );
};

export default AssignmentPanel;
