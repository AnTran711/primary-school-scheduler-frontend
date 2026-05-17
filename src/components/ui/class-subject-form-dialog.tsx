import {
  classSubjectSchema,
  type ClassSubjectFormValues
} from '@/schemas/class-subject.schema';
import { useSubjectStore } from '@/stores/subject-store';
import type { ClassSubject } from '@/types/class-subject';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

export interface ClassSubjectFormDialogProps {
  open: boolean;
  editTarget?: ClassSubject;
  assignedSubjectIds: string[]; // các môn đã được gán vào lớp
  onClose: () => void;
  onSubmit: (values: ClassSubjectFormValues) => void;
  loading: boolean;
}

const ClassSubjectFormDialog = ({
  open,
  editTarget,
  assignedSubjectIds,
  onClose,
  onSubmit,
  loading
}: ClassSubjectFormDialogProps) => {
  const subjects = useSubjectStore((state) => state.subjects);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ClassSubjectFormValues>({
    resolver: zodResolver(
      classSubjectSchema
    ) as Resolver<ClassSubjectFormValues>,
    defaultValues: { subjectId: '', lessonsPerWeek: 1 }
  });

  useEffect(() => {
    if (open) {
      reset(
        editTarget
          ? {
              subjectId: editTarget.subjectId,
              lessonsPerWeek: editTarget.lessonsPerWeek
            }
          : { subjectId: '', lessonsPerWeek: 1 }
      );
    }
  }, [open, editTarget, reset]);

  // Khi edit chỉ cho đổi số tiết, không cho đổi môn
  const availableSubjects = subjects.filter(
    (s) => !assignedSubjectIds.includes(s.id) || s.id === editTarget?.subjectId
  );

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editTarget ? 'Chỉnh sửa môn học' : 'Thêm môn học cho lớp'}
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Môn học */}
            <Controller
              name="subjectId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  size="small"
                  label="Môn học"
                  disabled={!!editTarget || loading} // không cho đổi môn khi edit
                  error={!!errors.subjectId}
                  helperText={errors.subjectId?.message ?? ' '}
                >
                  {availableSubjects.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Số tiết */}
            <Controller
              name="lessonsPerWeek"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label="Số tiết mỗi tuần"
                  type="number"
                  disabled={loading}
                  error={!!errors.lessonsPerWeek}
                  helperText={errors.lessonsPerWeek?.message ?? ' '}
                  slotProps={{ htmlInput: { min: 1, max: 35 } }}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={loading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ClassSubjectFormDialog;
