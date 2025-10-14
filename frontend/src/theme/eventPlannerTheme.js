// Enhanced Theme for Event Planner
// Modern color palette, typography, and component styles
import { createTheme } from '@mui/material/styles';

const eventPlannerTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2D5F7F', // Deep blue - trustworthy, professional
      light: '#4A8AB8',
      dark: '#1A3D54',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6B6B', // Coral red - energetic, exciting
      light: '#FF9999',
      dark: '#E63946',
      contrastText: '#FFFFFF',
    },
    accent: {
      main: '#4ECDC4', // Teal - creative, modern
      light: '#7ED9D1',
      dark: '#36A69E',
      contrastText: '#1A1A1A',
    },
    success: {
      main: '#06D6A0', // Mint green
      light: '#39E0B5',
      dark: '#04A376',
    },
    warning: {
      main: '#FFD93D', // Golden yellow
      light: '#FFE56D',
      dark: '#E6C235',
    },
    error: {
      main: '#E63946',
      light: '#FF6B74',
      dark: '#B92A35',
    },
    background: {
      default: '#F8FAFB',
      paper: '#FFFFFF',
      elevated: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accentGradient: 'linear-gradient(135deg, #4ECDC4 0%, #2D5F7F 100%)',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#5A6C7D',
      disabled: '#A0AEC0',
      hint: '#A0AEC0',
    },
    divider: '#E2E8F0',
    action: {
      hover: 'rgba(45, 95, 127, 0.04)',
      selected: 'rgba(45, 95, 127, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
  },
  
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.9375rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
  },
  
  shape: {
    borderRadius: 12,
  },
  
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.08)',
    '0px 8px 16px rgba(0, 0, 0, 0.1)',
    '0px 12px 24px rgba(0, 0, 0, 0.12)',
    '0px 16px 32px rgba(0, 0, 0, 0.14)',
    '0px 20px 40px rgba(0, 0, 0, 0.16)',
    '0px 24px 48px rgba(0, 0, 0, 0.18)',
    '0px 2px 8px rgba(45, 95, 127, 0.15)',
    '0px 4px 12px rgba(45, 95, 127, 0.2)',
    '0px 8px 20px rgba(45, 95, 127, 0.25)',
    '0px 12px 28px rgba(45, 95, 127, 0.3)',
    '0px 16px 36px rgba(45, 95, 127, 0.35)',
    '0px 20px 44px rgba(45, 95, 127, 0.4)',
    '0px 24px 52px rgba(45, 95, 127, 0.45)',
    '0px 28px 60px rgba(45, 95, 127, 0.5)',
    // Glassmorphism shadows
    '0px 8px 32px rgba(31, 38, 135, 0.37)',
    '0px 4px 16px rgba(255, 107, 107, 0.3)',
    '0px 4px 16px rgba(78, 205, 196, 0.3)',
    '0px 8px 24px rgba(45, 95, 127, 0.2)',
  ],
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2D5F7F 0%, #1A3D54 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1A3D54 0%, #0F2633 100%)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
        sizeLarge: {
          padding: '14px 32px',
          fontSize: '1rem',
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'all 0.2s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2D5F7F',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        colorPrimary: {
          background: 'linear-gradient(135deg, #2D5F7F 0%, #4A8AB8 100%)',
        },
        colorSecondary: {
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF9999 100%)',
        },
      },
    },
    
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0px 24px 48px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '24px 32px',
          background: 'linear-gradient(135deg, #F8FAFB 0%, #FFFFFF 100%)',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
    
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '24px 32px',
        },
      },
    },
    
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9375rem',
          minHeight: 56,
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#2D5F7F',
            opacity: 1,
          },
          '&.Mui-selected': {
            color: '#2D5F7F',
          },
        },
      },
    },
    
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          background: 'linear-gradient(90deg, #2D5F7F 0%, #4ECDC4 100%)',
        },
      },
    },
    
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          height: 8,
          background: 'rgba(45, 95, 127, 0.1)',
        },
        bar: {
          borderRadius: 10,
          background: 'linear-gradient(90deg, #4ECDC4 0%, #2D5F7F 100%)',
        },
      },
    },
  },
});

// Custom animation variants for framer-motion
export const animationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
  
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  
  cardHover: {
    whileHover: { 
      scale: 1.02, 
      y: -4,
      transition: { duration: 0.2 } 
    },
    whileTap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    },
  },
  
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

// Glassmorphism effect
export const glassmorphism = {
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
};

// Gradient backgrounds
export const gradients = {
  primary: 'linear-gradient(135deg, #2D5F7F 0%, #1A3D54 100%)',
  secondary: 'linear-gradient(135deg, #FF6B6B 0%, #E63946 100%)',
  accent: 'linear-gradient(135deg, #4ECDC4 0%, #36A69E 100%)',
  hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  success: 'linear-gradient(135deg, #06D6A0 0%, #04A376 100%)',
  subtle: 'linear-gradient(135deg, #F8FAFB 0%, #E2E8F0 100%)',
};

export default eventPlannerTheme;
