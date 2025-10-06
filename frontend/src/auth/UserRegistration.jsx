import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, CssBaseline, Box, Typography, TextField, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Event as EventIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { register } from '../api/auth';

// AI-themed styled components
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(5deg); }
  66% { transform: translateY(-10px) rotate(-5deg); }
`;

const BackgroundContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(-45deg, #667eea, #764ba2, #667eea, #764ba2)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 15s ease infinite`,
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
}));

const FloatingIcon = styled(Box)(({ size = '60px', top, bottom, left, right, duration = '6s' }) => ({
  position: 'absolute',
  top,
  bottom,
  left,
  right,
  fontSize: size,
  animation: `${float} ${duration} ease-in-out infinite`,
  opacity: 0.4,
  pointerEvents: 'none',
  color: 'rgba(255, 255, 255, 0.6)',
}));

const GlassPaper = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(4),
  maxWidth: '500px',
  width: '100%',
  position: 'relative',
}));

const AITextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.95)',
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 0 20px rgba(102, 126, 234, 0.3)',
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
  }
}));

const AIButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '12px',
  padding: theme.spacing(1.5, 3),
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)',
  },
  '&:disabled': {
    background: 'rgba(102, 126, 234, 0.5)',
  }
}));

export default function UserRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('role', 'user');

    setLoading(true);
    setError('');
    try {
      const res = await register(formData);
      if (res.token) localStorage.setItem('token', res.token);
      navigate('/me');
    } catch (e) {
      setError(e?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundContainer>
      <FloatingIcon size="100px" top="15%" left="10%" duration="8s">
        <EventIcon sx={{ fontSize: 'inherit' }} />
      </FloatingIcon>
      <FloatingIcon size="80px" top="25%" right="15%" duration="6s">
        <EventIcon sx={{ fontSize: 'inherit' }} />
      </FloatingIcon>
      <FloatingIcon size="60px" bottom="20%" left="15%" duration="7s">
        <EventIcon sx={{ fontSize: 'inherit' }} />
      </FloatingIcon>
      <FloatingIcon size="90px" bottom="15%" right="20%" duration="9s">
        <EventIcon sx={{ fontSize: 'inherit' }} />
      </FloatingIcon>

      <GlassPaper>
        <Box textAlign="center" sx={{ mb: 4 }}>
          <Box sx={{ mb: 2 }}>
            <EventIcon sx={{ 
              fontSize: 48, 
              color: 'white',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '12px',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
            }} />
          </Box>
          <Typography 
            component="h1" 
            variant="h4"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Event Planner Registration
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
            Join our elite network of event professionals
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <AITextField 
            margin="normal" 
            required 
            fullWidth 
            id="name" 
            label="Full Name" 
            name="name" 
            autoFocus 
          />
          <AITextField 
            margin="normal" 
            required 
            fullWidth 
            id="email" 
            label="Email Address" 
            name="email" 
            autoComplete="email" 
          />
          <AITextField 
            margin="normal" 
            fullWidth 
            id="phone" 
            label="Phone Number" 
            name="phone" 
          />
          <AITextField 
            margin="normal" 
            required 
            fullWidth 
            name="password" 
            label="Password" 
            type="password" 
            id="password" 
            autoComplete="new-password" 
          />
          
          {error && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              background: 'rgba(244, 67, 54, 0.1)', 
              borderRadius: '12px',
              border: '1px solid rgba(244, 67, 54, 0.3)'
            }}>
              <Typography color="error" variant="body2" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
            </Box>
          )}

          <AIButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Creating Account...' : '🎯 Start Planning Events'}
          </AIButton>

          <Box textAlign="center" sx={{ mt: 3 }}>
            <Button
              component={Link}
              to="/register"
              startIcon={<ArrowBackIcon />}
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              Back to Role Selection
            </Button>
          </Box>
        </Box>
      </GlassPaper>
    </BackgroundContainer>
  );
}