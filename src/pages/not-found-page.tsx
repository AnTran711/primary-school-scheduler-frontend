import { Box, Button, Typography } from '@mui/material';
import { HomeOutlined, SentimentDissatisfiedOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// ─── Component ────────────────────────────────────────────────────────────────

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f0f9ff 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background:
            'radial-gradient(circle at 30% 30%, rgba(30, 64, 175, 0.04) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(45, 212, 191, 0.04) 0%, transparent 60%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeInUp 0.5s ease-out',
          '@keyframes fadeInUp': {
            from: { opacity: 0, transform: 'translateY(16px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          }
        }}
      >
        {/* 404 Number */}
        <Typography
          sx={{
            fontSize: { xs: '6rem', sm: '8rem' },
            fontWeight: 800,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #1E40AF 0%, #2dd4bf 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          404
        </Typography>

        {/* Icon */}
        <SentimentDissatisfiedOutlined
          sx={{
            fontSize: 56,
            color: 'text.disabled',
            mb: 2,
            animation: 'bounce 2s ease-in-out infinite',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-8px)' }
            }
          }}
        />

        {/* Title */}
        <Typography
          variant="h5"
          sx={{ mb: 1, color: 'text.primary' }}
        >
          Không tìm thấy trang
        </Typography>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: 'text.secondary',
            maxWidth: 400,
            mx: 'auto'
          }}
        >
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          Hãy quay lại trang chủ để tiếp tục.
        </Typography>

        {/* Back home button */}
        <Button
          variant="contained"
          size="large"
          startIcon={<HomeOutlined />}
          onClick={() => navigate('/', { replace: true })}
          sx={{ px: 4, py: 1.25 }}
        >
          Về trang chủ
        </Button>
      </Box>
    </Box>
  );
};

export default NotFoundPage;
