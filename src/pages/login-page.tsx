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
    control,
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
        background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f0f9ff 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at 30% 30%, rgba(30, 64, 175, 0.04) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(45, 212, 191, 0.04) 0%, transparent 60%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          width: '100%',
          maxWidth: 420,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid rgba(255,255,255,0.7)',
          p: 4,
          position: 'relative',
          zIndex: 1,
          animation: 'fadeInUp 0.5s ease-out',
          '@keyframes fadeInUp': {
            from: { opacity: 0, transform: 'translateY(16px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          }
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{ color: 'primary.main' }}
          >
            EduScheduler
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
            Đăng nhập để tiếp tục
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

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
              disabled={isSubmitting}
              error={!!errors.username}
              helperText={errors.username?.message ?? ' '}
              sx={{ mb: 1 }}
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
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              disabled={isSubmitting}
              error={!!errors.password}
              helperText={errors.password?.message ?? ' '}
              sx={{ mb: 3 }}
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
          )}
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
          sx={{
            py: 1.25,
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
