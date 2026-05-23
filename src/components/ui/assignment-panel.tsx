import { useEffect, useState } from 'react';
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
import {
  AddOutlined,
  ArrowBackOutlined,
  DeleteOutlined,
  SaveOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import type { AssignmentRow, TeacherAvailability } from '@/types/lesson';
import type { ClassSubject } from '@/types/class-subject';
import {
  fetchLessonsByClassSubjectAPI,
  saveLessonAssignmentAPI
} from '@/api/lesson.api';
import { fetchTeacherAvailabilityAPI } from '@/api/teacher.api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const rowsEqual = (a: AssignmentRow[], b: AssignmentRow[]): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

const getTotalAssigned = (rows: AssignmentRow[]) =>
  rows.reduce((sum, r) => sum + (Number(r.lessonCount) || 0), 0);

// ─── Props ────────────────────────────────────────────────────────────────────

interface AssignmentPanelProps {
  classSubject: ClassSubject;
  onBack: () => void;
  onSaveSuccess: (classSubjectId: string, assignments: AssignmentRow[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AssignmentPanel = ({
  classSubject,
  onBack,
  onSaveSuccess
}: AssignmentPanelProps) => {
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [initialRows, setInitialRows] = useState<AssignmentRow[]>([]);
  const [teacherAvailability, setTeacherAvailability] = useState<
    TeacherAvailability[]
  >([]);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load dữ liệu khi classSubject thay đổi
  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const [lessonDataRes, availabilityDataRes] = await Promise.all([
          fetchLessonsByClassSubjectAPI(classSubject.id),
          fetchTeacherAvailabilityAPI(classSubject.id)
        ]);

        const loaded = lessonDataRes?.data?.assignments ?? [];
        setRows(loaded);
        setInitialRows(loaded);
        setTeacherAvailability(availabilityDataRes?.data ?? []);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [classSubject.id]);

  // ── Computed values ──────────────────────────────────────────────────────────

  const totalAssigned = getTotalAssigned(rows);
  const remaining = classSubject.lessonsPerWeek - totalAssigned;
  const isComplete = totalAssigned === classSubject.lessonsPerWeek;
  const isOver = totalAssigned > classSubject.lessonsPerWeek;
  const isDirty = !rowsEqual(rows, initialRows); // có thay đổi so với lúc load

  // Giáo viên chưa được chọn trong các row khác (để tránh duplicate)
  const getAvailableTeachers = (currentRowIdx: number) =>
    teacherAvailability.filter(
      (t) =>
        !rows.some(
          (r, idx) => idx !== currentRowIdx && r.teacherId === t.teacherId
        )
    );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAddRow = () => {
    setRows((prev) => [...prev, { teacherId: '', lessonCount: 1 }]);
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
    if (rows.some((r) => !r.teacherId)) {
      toast.error('Vui lòng chọn giáo viên cho tất cả các dòng');
      return;
    }
    if (!isComplete) {
      toast.error(
        remaining > 0
          ? `Còn thiếu ${remaining} tiết chưa được phân công`
          : `Vượt quá ${Math.abs(remaining)} tiết, vui lòng điều chỉnh`
      );
      return;
    }

    // Validate không vượt quá số tiết của giáo viên
    for (const row of rows) {
      const teacher = teacherAvailability.find(
        (t) => t.teacherId === row.teacherId
      );
      if (!teacher) continue;
      const remaining =
        teacher.numberOfLessonsPerWeek - teacher.assignedLessons;
      if (row.lessonCount > remaining) {
        toast.error(
          `Giáo viên ${teacher.teacherName} chỉ còn ${remaining} tiết, không thể phân công ${row.lessonCount} tiết`
        );
        return;
      }
    }

    try {
      setSaving(true);
      const res = await saveLessonAssignmentAPI({
        classSubjectId: classSubject.id,
        assignments: rows
      });
      toast.success(res.message);

      // Cập nhật initialRows để isDirty = false sau khi lưu
      setInitialRows([...rows]);

      // Thông báo lên LessonPage để cập nhật lessonMap
      onSaveSuccess(classSubject.id, rows);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

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
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {classSubject.lessonsPerWeek} tiết/tuần
          </Typography>
        </Box>
      </Box>

      {/* Bảng phân công */}
      <Paper
        variant="outlined"
        sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 130px 48px',
            gap: 2,
            px: 2,
            py: 1.25,
            bgcolor: 'grey.50',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          {['Giáo viên', 'Số tiết', ''].map((label) => (
            <Typography
              key={label}
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: 'uppercase',
                textAlign: label === 'Số tiết' ? 'center' : 'left',
                color: 'text.secondary'
              }}
            >
              {label}
            </Typography>
          ))}
        </Box>

        {/* Rows */}
        {rows.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              Chưa có giáo viên nào được phân công
            </Typography>
          </Box>
        ) : (
          rows.map((row, idx) => {
            const availableTeachers = getAvailableTeachers(idx);
            const selectedTeacher = teacherAvailability.find(
              (t) => t.teacherId === row.teacherId
            );

            return (
              <Box
                key={idx}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 130px 48px',
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
                  onChange={(e) => handleChangeTeacher(idx, e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                >
                  {availableTeachers.map((t) => {
                    const remaining =
                      t.numberOfLessonsPerWeek - t.assignedLessons;
                    return (
                      <MenuItem
                        key={t.teacherId}
                        value={t.teacherId}
                        disabled={remaining <= 0}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            gap: 2
                          }}
                        >
                          <Typography variant="body2">
                            {t.teacherName}
                          </Typography>
                          {/* Không hiển thị số tiết còn lại của giáo viên đang được chọn */}
                          {t.teacherId !== selectedTeacher?.teacherId && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                color:
                                  remaining > 0 ? 'success.main' : 'error.main'
                              }}
                            >
                              còn {remaining} tiết
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </TextField>

                {/* Lesson count */}
                <TextField
                  size="small"
                  type="number"
                  value={row.lessonCount}
                  onChange={(e) => handleChangeLessonCount(idx, e.target.value)}
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      max: selectedTeacher
                        ? selectedTeacher.numberOfLessonsPerWeek -
                          selectedTeacher.assignedLessons
                        : classSubject.lessonsPerWeek,
                      style: { textAlign: 'center' }
                    }
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
            );
          })
        )}

        {/* Footer tổng tiết */}
        <Divider />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 130px 48px',
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
            sx={{ fontWeight: 600, color: 'text.secondary' }}
          >
            Tổng
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              color: isOver
                ? 'error.main'
                : isComplete
                  ? 'success.main'
                  : 'text.primary'
            }}
          >
            {totalAssigned}/{classSubject.lessonsPerWeek}
            {isOver && ` (vượt ${Math.abs(remaining)})`}
            {!isOver && !isComplete && remaining > 0 && ` (còn ${remaining})`}
          </Typography>
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
          disabled={rows.length >= teacherAvailability.length || saving}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Thêm giáo viên
        </Button>

        <Button
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={() => handleSave()}
          disabled={saving || rows.length === 0 || !isDirty} // ← chỉ enable khi có thay đổi
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          {saving ? 'Đang lưu...' : 'Lưu phân công'}
        </Button>
      </Box>
    </Box>
  );
};

export default AssignmentPanel;
