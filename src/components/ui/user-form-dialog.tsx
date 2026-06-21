import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material';
import {
  CloseOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined
} from '@mui/icons-material';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import type { UserRecord } from '@/types/user';
import { userSchema, type UserFormValues } from '@/schemas/user.schema';
// ─── Types ────────────────────────────────────────────────────────────────────
export interface UserFormDialogProps {
  open: boolean;
  editTarget?: UserRecord;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
  loading: boolean;
}
// ─── Component ────────────────────────────────────────────────────────────────
const UserFormDialog = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  loading
}: UserFormDialogProps) => {
  const isEdit = Boolean(editTarget);
  const [showPassword, setShowPassword] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  // 1. Theo dõi sự thay đổi của prop 'open' để reset state ngay trong lúc render
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setShowPassword(false); // Reset password visibility khi dialog mở
    }
  }

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema) as Resolver<UserFormValues>,
    defaultValues: { username: '', password: '' }
  });

  useEffect(() => {
    if (open) {
      reset(
        editTarget
          ? {
              username: editTarget.username,
              password: ''
            }
          : { username: '', password: '' }
      );
    }
  }, [open, editTarget, reset]);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: 'flex', flexDirection: 'column' }}
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
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              {isEdit ? 'Đổi mật khẩu' : 'Thêm người dùng mới'}
            </Typography>
            <IconButton size="small" onClick={onClose} disabled={loading}>
              <CloseOutlined fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        {/* Fields */}
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Username */}
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label="Tên đăng nhập"
                  disabled={isEdit || loading}
                  error={!!errors.username}
                  helperText={errors.username?.message ?? ' '}
                />
              )}
            />
            {/* Password */}
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={isEdit ? 'Mật khẩu mới' : 'Mật khẩu'}
                  type={showPassword ? 'text' : 'password'}
                  disabled={loading}
                  error={!!errors.password}
                  helperText={errors.password?.message ?? ' '}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword((p) => !p)}
                            edge="end"
                          >
                            {showPassword ? (
                              <VisibilityOffOutlined fontSize="small" />
                            ) : (
                              <VisibilityOutlined fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              )}
            />
          </Box>
        </DialogContent>
        <Divider />
        {/* Actions */}
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
export default UserFormDialog;
