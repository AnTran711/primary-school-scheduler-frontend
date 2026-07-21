import { Box, CircularProgress, Typography } from '@mui/material';

interface SplashScreenProps {
  retryCount: number;
  error: string | null;
}

const SplashScreen = ({ retryCount, error }: SplashScreenProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
        color: '#fff',
        gap: 3,
        userSelect: 'none'
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          letterSpacing: 1,
          textShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}
      >
        Edu Scheduler
      </Typography>

      {error ? (
        <Typography
          variant="body1"
          sx={{
            color: '#ff8a80',
            textAlign: 'center',
            maxWidth: 400,
            px: 2
          }}
        >
          {error}
        </Typography>
      ) : (
        <>
          <CircularProgress
            size={40}
            thickness={4}
            sx={{ color: 'rgba(255,255,255,0.9)' }}
          />
          <Typography
            variant="body1"
            sx={{ opacity: 0.85 }}
          >
            {retryCount === 0
              ? 'Đang khởi động hệ thống...'
              : `Đang chờ server sẵn sàng... (${retryCount})`}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default SplashScreen;
