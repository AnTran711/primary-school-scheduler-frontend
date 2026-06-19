import { Box, Typography } from '@mui/material';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        {/* Title + Subtitle */}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ color: 'text.primary' }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{ mt: 0.5, color: 'text.secondary' }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Actions (search, filter, buttons) */}
        {actions && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexShrink: 0
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
