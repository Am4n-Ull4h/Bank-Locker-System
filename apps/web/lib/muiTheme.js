'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0f3a6d',
      dark: '#0b2c53',
      light: '#2b5f9b',
    },
    secondary: {
      main: '#f59e0b',
      dark: '#d97706',
      light: '#fbbf24',
    },
    success: {
      main: '#059669',
      light: '#10b981',
      dark: '#047857',
    },
    warning: {
      main: '#d97706',
      light: '#f59e0b',
    },
    error: {
      main: '#dc2626',
      light: '#ef4444',
    },
    info: {
      main: '#0284c7',
      light: '#38bdf8',
    },
    background: {
      default: '#f1f5f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    divider: 'rgba(15,58,109,0.09)',
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    h3: { fontWeight: 800, letterSpacing: -0.5 },
    h4: { fontWeight: 800, letterSpacing: -0.3 },
    h5: { fontWeight: 800, letterSpacing: -0.3 },
    h6: { fontWeight: 700, letterSpacing: -0.15 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.6 },
    button: { fontWeight: 600, letterSpacing: 0.1 },
    caption: { lineHeight: 1.5 },
  },
  shadows: [
    'none',
    '0 1px 3px rgba(15,58,109,0.06)',
    '0 2px 6px rgba(15,58,109,0.08)',
    '0 4px 12px rgba(15,58,109,0.08)',
    '0 6px 16px rgba(15,58,109,0.1)',
    '0 8px 24px rgba(15,58,109,0.1)',
    '0 10px 28px rgba(15,58,109,0.12)',
    '0 12px 32px rgba(15,58,109,0.12)',
    '0 14px 36px rgba(15,58,109,0.14)',
    '0 16px 40px rgba(15,58,109,0.14)',
    '0 18px 44px rgba(15,58,109,0.15)',
    '0 20px 48px rgba(15,58,109,0.16)',
    '0 22px 52px rgba(15,58,109,0.16)',
    '0 24px 56px rgba(15,58,109,0.17)',
    '0 26px 60px rgba(15,58,109,0.18)',
    '0 28px 64px rgba(15,58,109,0.18)',
    '0 30px 68px rgba(15,58,109,0.19)',
    '0 32px 72px rgba(15,58,109,0.2)',
    '0 34px 76px rgba(15,58,109,0.2)',
    '0 36px 80px rgba(15,58,109,0.21)',
    '0 38px 84px rgba(15,58,109,0.22)',
    '0 40px 88px rgba(15,58,109,0.22)',
    '0 42px 92px rgba(15,58,109,0.23)',
    '0 44px 96px rgba(15,58,109,0.24)',
    '0 48px 100px rgba(15,58,109,0.25)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f1f5f9',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid rgba(15,58,109,0.09)',
          boxShadow: '0 4px 16px rgba(15,58,109,0.06)',
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          letterSpacing: 0.1,
        },
        contained: {
          boxShadow: '0 4px 12px rgba(15,58,109,0.25)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(15,58,109,0.35)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.78rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: 'rgba(15,58,109,0.05)',
            color: '#0f3a6d',
            fontWeight: 700,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(15,58,109,0.025) !important',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(15,58,109,0.07)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(15,58,109,0.1)',
        },
      },
    },
  },
});

export default theme;
