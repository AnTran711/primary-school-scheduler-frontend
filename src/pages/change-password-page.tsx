import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import {
  LockOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth-store';
import {
  changePasswordSchema,
  type ChangePasswordFormValues
} from '@/schemas/change-password.schema';
import PageHeader from '@/components/ui/page-header';

// ─── Component ────────────────────────────────────────────────────────────────

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' }
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await authApi.changePassword({
        oldPassword: values.oldPassword.trim(),
        newPassword: values.newPassword.trim()
      });

      // Đăng xuất và chuyển về trang đăng nhập
      const token = useAuthStore.getState().token;
      authApi.logout({ token: token ?? '' });
      logout();
      navigate('/login', { replace: true });

      // Toast hiện sau khi chuyển trang
      toast.success('Đổi mật khẩu thành công, vui lòng đăng nhập lại');
    } catch (error) {
      console.error('Change password failed:', error);
    }
  };

  // Helper to create password toggle adornment
  const passwordAdornment = (show: boolean, toggle: () => void) => (
    <InputAdornment position="end">
      <IconButton size="small" onClick={toggle} edge="end">
        {show ? (
          <VisibilityOffOutlined fontSize="small" />
        ) : (
          <VisibilityOutlined fontSize="small" />
        )}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 3 }}>
        <PageHeader
          title="Đổi mật khẩu"
          subtitle="Cập nhật mật khẩu đăng nhập của bạn"
        />

        {/* Form card */}
        <Paper
          variant="outlined"
          sx={{
            maxWidth: 480,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {/* Card header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 2,
              bgcolor: 'grey.50',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <LockOutlined fontSize="small" sx={{ color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Thông tin mật khẩu
            </Typography>
          </Box>

          {/* Form fields */}
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              px: 3,
              py: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {/* Old password */}
            <Controller
              name="oldPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label="Mật khẩu cũ"
                  type={showOld ? 'text' : 'password'}
                  disabled={isSubmitting}
                  error={!!errors.oldPassword}
                  helperText={errors.oldPassword?.message ?? ' '}
                  slotProps={{
                    input: {
                      endAdornment: passwordAdornment(showOld, () =>
                        setShowOld((p) => !p)
                      )
                    }
                  }}
                />
              )}
            />

            {/* New password */}
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label="Mật khẩu mới"
                  type={showNew ? 'text' : 'password'}
                  disabled={isSubmitting}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message ?? ' '}
                  slotProps={{
                    input: {
                      endAdornment: passwordAdornment(showNew, () =>
                        setShowNew((p) => !p)
                      )
                    }
                  }}
                />
              )}
            />

            {/* Confirm password */}
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label="Xác nhận mật khẩu mới"
                  type={showConfirm ? 'text' : 'password'}
                  disabled={isSubmitting}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message ?? ' '}
                  slotProps={{
                    input: {
                      endAdornment: passwordAdornment(showConfirm, () =>
                        setShowConfirm((p) => !p)
                      )
                    }
                  }}
                />
              )}
            />

            <Divider />

            {/* Submit */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{ px: 3 }}
              >
                {isSubmitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ChangePasswordPage;
