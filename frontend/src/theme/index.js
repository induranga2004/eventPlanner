import { createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

// Color Hunt Palette: https://colorhunt.co/palette/f9dbba5b99c21a48701f316f
const colorHunt = {
  darkPurpleBlue: '#1F316F',  // Primary dark backgrounds
  mediumBlue: '#1A4870',       // Secondary backgrounds, cards
  lightBlue: '#5B99C2',        // Accents, links, CTAs
  cream: '#F9DBBA',            // Text on dark backgrounds
};

export const brandTokens = {
  palette: {
    primary: {
      main: colorHunt.darkPurpleBlue,
      light: colorHunt.mediumBlue,
      dark: '#15234A',
      contrastText: colorHunt.cream,
    },
    secondary: {
      main: colorHunt.lightBlue,
      light: '#7FB3D5',
      dark: '#3D7CA5',
      contrastText: colorHunt.darkPurpleBlue,
    },
    tertiary: {
      main: colorHunt.cream,
      contrast: colorHunt.darkPurpleBlue,
    },
    background: {
      default: colorHunt.darkPurpleBlue,
      paper: colorHunt.mediumBlue,
      subtle: '#1E3A5F',
      elevated: 'rgba(26, 72, 112, 0.85)',
    },
    text: {
      primary: colorHunt.cream,
      secondary: 'rgba(249, 219, 186, 0.85)',
      muted: 'rgba(249, 219, 186, 0.65)',
      disabled: 'rgba(249, 219, 186, 0.4)',
      onLight: colorHunt.darkPurpleBlue,
    },
    divider: 'rgba(249, 219, 186, 0.15)',
    success: {
      main: '#5B99C2',
      light: '#7FB3D5',
      dark: '#3D7CA5',
    },
    warning: {
      main: '#F9DBBA',
      light: '#FBE7CE',
      dark: '#E6C79F',
    },
    error: {
      main: '#E07A5F',
      dark: '#C95F43',
    },
    accent: {
      main: colorHunt.lightBlue,
      hover: '#7FB3D5',
      active: '#4A8AB5',
    },
    // Gold accent for Pro features
    gold: {
      main: '#FFD700',
      light: '#FFE55C',
      dark: '#DAA520',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.04em',
      color: colorHunt.cream,
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
      color: colorHunt.cream,
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: colorHunt.cream,
    },
    h4: {
      fontWeight: 600,
      color: colorHunt.cream,
    },
    h5: {
      fontWeight: 600,
      color: colorHunt.cream,
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.02em',
      color: colorHunt.cream,
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: '0.04em',
      color: colorHunt.cream,
    },
    body1: {
      fontWeight: 400,
      lineHeight: 1.6,
      color: colorHunt.cream,
    },
    body2: {
      fontWeight: 400,
      lineHeight: 1.5,
      color: 'rgba(249, 219, 186, 0.85)',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'none',
    },
  },
  shadows: {
    glow: `0 20px 45px rgba(31, 49, 111, 0.4)`,
    soft: `0 12px 30px rgba(31, 49, 111, 0.3)`,
    card: `0 8px 24px rgba(0, 0, 0, 0.15)`,
    inset: `inset 0 1px 0 rgba(249, 219, 186, 0.08)`,
  },
};

const baseTheme = createTheme({
  palette: brandTokens.palette,
  typography: brandTokens.typography,
  shape: {
    borderRadius: 12,
  },
});

const componentOverrides = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body, #root': {
          backgroundColor: colorHunt.darkPurpleBlue,
          color: colorHunt.cream,
        },
        body: {
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(91, 153, 194, 0.12), transparent 50%), 
                           radial-gradient(circle at 80% 80%, rgba(26, 72, 112, 0.15), transparent 50%)`,
          minHeight: '100vh',
        },
        a: {
          color: colorHunt.lightBlue,
          textDecoration: 'none',
          transition: 'color 0.2s ease',
          '&:hover': {
            color: '#7FB3D5',
          },
        },
        '*::-webkit-scrollbar': {
          width: '10px',
          height: '10px',
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: colorHunt.darkPurpleBlue,
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: colorHunt.lightBlue,
          borderRadius: '999px',
          border: `2px solid ${colorHunt.darkPurpleBlue}`,
          '&:hover': {
            backgroundColor: '#7FB3D5',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '24px !important',
          paddingRight: '24px !important',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colorHunt.mediumBlue,
          borderRadius: 16,
          border: `1px solid rgba(249, 219, 186, 0.12)`,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'none',
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          backgroundColor: colorHunt.lightBlue,
          color: colorHunt.darkPurpleBlue,
          boxShadow: `0 4px 12px rgba(91, 153, 194, 0.3)`,
          '&:hover': {
            backgroundColor: '#7FB3D5',
            boxShadow: `0 6px 16px rgba(91, 153, 194, 0.4)`,
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedSecondary: {
          backgroundColor: colorHunt.mediumBlue,
          color: colorHunt.cream,
          border: `1px solid ${colorHunt.lightBlue}`,
          '&:hover': {
            backgroundColor: '#1E3A5F',
            borderColor: '#7FB3D5',
          },
        },
        outlined: {
          borderColor: colorHunt.lightBlue,
          color: colorHunt.cream,
          '&:hover': {
            backgroundColor: 'rgba(91, 153, 194, 0.1)',
            borderColor: '#7FB3D5',
          },
        },
        text: {
          color: colorHunt.cream,
          '&:hover': {
            backgroundColor: 'rgba(249, 219, 186, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        InputLabelProps: {
          shrink: true,
        },
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(31, 49, 111, 0.4)',
            borderRadius: 12,
            color: colorHunt.cream,
            fontSize: '1rem',
            transition: 'all 0.25s ease',
            marginTop: '8px',
            '& fieldset': {
              borderColor: 'rgba(249, 219, 186, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: colorHunt.lightBlue,
            },
            '&.Mui-focused fieldset': {
              borderColor: colorHunt.lightBlue,
              borderWidth: '2px',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(31, 49, 111, 0.6)',
              boxShadow: `0 0 0 3px rgba(91, 153, 194, 0.15)`,
            },
            '& input': {
              padding: '14px 16px',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(249, 219, 186, 0.85)',
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
            transform: 'translate(0, -1.5px) scale(1)',
            position: 'relative',
            marginBottom: '4px',
            '&.Mui-focused': {
              color: colorHunt.lightBlue,
            },
            '&.Mui-error': {
              color: '#E07A5F',
            },
          },
          '& .MuiInputBase-input': {
            color: colorHunt.cream,
            fontSize: '1rem',
            fontWeight: 500,
            '&::placeholder': {
              color: 'rgba(249, 219, 186, 0.5)',
              opacity: 1,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colorHunt.mediumBlue,
          borderRadius: 16,
          border: `1px solid rgba(249, 219, 186, 0.12)`,
          color: colorHunt.cream,
        },
        outlined: {
          borderColor: `rgba(249, 219, 186, 0.2)`,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          color: colorHunt.cream,
        },
        standardError: {
          backgroundColor: 'rgba(224, 122, 95, 0.15)',
          borderColor: '#E07A5F',
        },
        standardWarning: {
          backgroundColor: 'rgba(249, 219, 186, 0.15)',
          borderColor: colorHunt.cream,
        },
        standardSuccess: {
          backgroundColor: 'rgba(91, 153, 194, 0.15)',
          borderColor: colorHunt.lightBlue,
        },
        outlinedError: {
          borderColor: '#E07A5F',
          color: colorHunt.cream,
        },
        outlinedWarning: {
          borderColor: colorHunt.cream,
          color: colorHunt.cream,
        },
        outlinedSuccess: {
          borderColor: colorHunt.lightBlue,
          color: colorHunt.cream,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          color: colorHunt.lightBlue,
          textDecoration: 'none',
          transition: 'color 0.2s ease',
          '&:hover': {
            color: '#7FB3D5',
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(91, 153, 194, 0.2)',
          color: colorHunt.cream,
          borderColor: 'rgba(91, 153, 194, 0.3)',
          fontWeight: 500,
        },
        outlined: {
          borderColor: 'rgba(249, 219, 186, 0.3)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(249, 219, 186, 0.15)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid rgba(249, 219, 186, 0.15)`,
        },
        indicator: {
          backgroundColor: colorHunt.lightBlue,
          height: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          color: 'rgba(249, 219, 186, 0.7)',
          '&.Mui-selected': {
            color: colorHunt.cream,
          },
          '&:hover': {
            color: colorHunt.cream,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: 'rgba(249, 219, 186, 0.5)',
          '&.Mui-checked': {
            color: colorHunt.lightBlue,
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          color: colorHunt.cream,
        },
      },
    },
  },
});

const theme = createTheme(deepmerge(baseTheme, componentOverrides));

export default theme;
export { colorHunt };
