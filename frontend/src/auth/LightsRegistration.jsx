import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, CssBaseline, Box, Typography, TextField, Button, Alert } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Lightbulb as LightIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { register } from '../api/auth';

// AI-themed styled components for Lighting Services
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
  background: 'linear-gradient(-45deg, #ff9800, #f57c00, #ffb74d, #ff9800)',
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
  opacity: 0.6,
  pointerEvents: 'none',
  color: 'rgba(255, 255, 255, 0.8)',
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
      boxShadow: '0 0 20px rgba(255, 152, 0, 0.3)',
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
  }
}));

const AIButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
  borderRadius: '12px',
  padding: theme.spacing(1.5, 3),
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 30px rgba(255, 152, 0, 0.4)',
  },
  '&:disabled': {
    background: 'rgba(255, 152, 0, 0.5)',
  }
}));

export default function LightsRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('role', 'lights');

    // Debugging: Log FormData entries
    console.log('FormData entries:', [...formData.entries()]);

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
      {/* Floating light icons */}
      <FloatingIcon sx={{ position: 'absolute', top: '15%', left: '10%' }}>
        <LightIcon sx={{ fontSize: '60px', color: 'rgba(255,255,255,0.5)' }} />
      </FloatingIcon>
      <FloatingIcon sx={{ position: 'absolute', top: '25%', right: '15%' }}>
        <LightIcon sx={{ fontSize: '45px', color: 'rgba(255,255,255,0.4)' }} />
      </FloatingIcon>
      <FloatingIcon sx={{ position: 'absolute', bottom: '20%', left: '20%' }}>
        <LightIcon sx={{ fontSize: '55px', color: 'rgba(255,255,255,0.45)' }} />
      </FloatingIcon>
      
      <GlassPaper>
        <FloatingIcon sx={{ width: '80px', height: '80px', margin: '0 auto 20px' }}>
          <LightIcon sx={{ fontSize: '32px', color: '#fff' }} />
        </FloatingIcon>
        
        <Typography variant="h4" sx={{ 
          background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '30px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}>
          Lighting Services Registration
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              background: 'rgba(244, 67, 54, 0.2)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: '#ff6b6b'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <AITextField margin="normal" required fullWidth id="companyName" label="Company/Service Name" name="companyName" autoFocus />
          <AITextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" />
          <AITextField margin="normal" fullWidth id="phone" label="Phone Number" name="phone" />
          <AITextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="new-password" />
          <AITextField margin="normal" fullWidth id="contactPerson" label="Contact Person" name="contactPerson" />
          <AITextField margin="normal" fullWidth id="address" label="Business Address" name="address" />
          <AITextField margin="normal" fullWidth id="lightTypes" label="Lighting Equipment Types" name="lightTypes" placeholder="LED, Stage lights, Ambient lighting, etc." multiline rows={2} />
          <AITextField margin="normal" fullWidth id="eventTypes" label="Event Types" name="eventTypes" placeholder="Weddings, Concerts, Corporate events, etc." multiline rows={2} />
          <AITextField margin="normal" fullWidth id="crewSize" label="Crew Size" name="crewSize" type="number" />
          <AITextField margin="normal" fullWidth id="services" label="Services Offered" name="services" placeholder="Setup, Operation, Design consultation, etc." multiline rows={2} />
          <AITextField margin="normal" fullWidth id="website" label="Website" name="website" placeholder="https://yourwebsite.com" />
          
          <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
            Upload Service Photo:
          </Typography>
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '2px dashed rgba(255, 255, 255, 0.3)',
            padding: '20px',
            textAlign: 'center',
            margin: '10px 0',
            '& input[type="file"]': {
              color: '#fff',
              width: '100%',
            }
          }}>
            <input type="file" name="photo" accept="image/*" />
          </Box>
          <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
            Upload Additional Photo:
          </Typography>
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '2px dashed rgba(255, 255, 255, 0.3)',
            padding: '20px',
            textAlign: 'center',
            margin: '10px 0',
            '& input[type="file"]': {
              color: '#fff',
              width: '100%',
            }
          }}>
            <input type="file" name="additionalPhoto" accept="image/*" />
          </Box>
          <AITextField margin="normal" fullWidth id="instagramLink" label="Instagram Link" name="instagramLink" />
          <AITextField margin="normal" fullWidth id="facebookLink" label="Facebook Link" name="facebookLink" />
          
          <AIButton type="submit" fullWidth sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Registering…' : 'Register Service'}
          </AIButton>
        </Box>
      </GlassPaper>
    </BackgroundContainer>
  );
}