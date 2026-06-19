import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E40AF', // màu chính
      contrastText: '#fff'
    },
    secondary: {
      main: '#2dd4bf'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700,
      fontSize: '1.375rem',
      letterSpacing: '-0.01em'
    },
    h6: {
      fontWeight: 700,
      fontSize: '1.125rem',
      letterSpacing: '-0.01em'
    },
    body2: {
      fontSize: '0.875rem'
    },
    caption: {
      fontSize: '0.75rem'
    }
  },
  components: {
    // ── Button ──────────────────────────────────────────────────────────
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.8125rem'
        },
        sizeMedium: {
          padding: '8px 20px',
          fontSize: '0.875rem'
        },
        contained: {
          '&:hover': {
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }
        }
      }
    },
    // ── TextField / OutlinedInput ────────────────────────────────────────
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#94a3b8'
          }
        }
      }
    },
    // ── Dialog ──────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }
      }
    },
    // ── Paper ───────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12
        }
      }
    },
    // ── Table ───────────────────────────────────────────────────────────
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            backgroundColor: '#f1f5f9'
          }
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          color: '#475569',
          letterSpacing: '0.05em',
          padding: '12px 16px'
        },
        body: {
          fontSize: '0.875rem',
          padding: '12px 16px',
          color: '#334155'
        }
      }
    },
    // ── Tooltip ─────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: '0.75rem'
        }
      }
    },
    // ── Chip ────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500
        }
      }
    }
  }
});

export default theme;
