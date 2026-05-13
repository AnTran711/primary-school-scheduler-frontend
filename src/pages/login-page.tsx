import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material';
import { VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth-store';
import { loginSchema, type LoginFormValues } from '@/schemas/login.schema';

// ─── Component ────────────────────────────────────────────────────────────────

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await authApi.login(data);
      console.log('Login successful:', response);

      login(response.user, response.token);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8fafc'
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          width: '100%',
          maxWidth: 400,
          bgcolor: '#fff',
          borderRadius: 3,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          p: 4
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: 'text.primary' }}
          >
            EduScheduler
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
            Đăng nhập để tiếp tục
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Username */}
        <TextField
          {...register('username')}
          fullWidth
          size="small"
          label="Tên đăng nhập"
          disabled={isSubmitting}
          error={!!errors.username}
          helperText={errors.username?.message ?? ' '}
          sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        {/* Password */}
        <TextField
          {...register('password')}
          fullWidth
          size="small"
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          disabled={isSubmitting}
          error={!!errors.password}
          helperText={errors.password?.message ?? ' '}
          sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword((prev) => !prev)}
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

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
          sx={{
            borderRadius: 2,
            py: 1.25,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem'
          }}
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </Box>
    </Box>
  );
};

export default LoginPage;
