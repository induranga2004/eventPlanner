import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, CssBaseline, Box, Typography, TextField, Button } from '@mui/material';
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
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Lighting Services Registration
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="companyName" label="Company/Service Name" name="companyName" autoFocus />
          <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" />
          <TextField margin="normal" fullWidth id="phone" label="Phone Number" name="phone" />
          <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="new-password" />
          <TextField margin="normal" fullWidth id="contactPerson" label="Contact Person" name="contactPerson" />
          <TextField margin="normal" fullWidth id="address" label="Business Address" name="address" />
          <TextField margin="normal" fullWidth id="lightTypes" label="Lighting Equipment Types" name="lightTypes" placeholder="LED, Stage lights, Ambient lighting, etc." multiline rows={2} />
          <TextField margin="normal" fullWidth id="eventTypes" label="Event Types" name="eventTypes" placeholder="Weddings, Concerts, Corporate events, etc." multiline rows={2} />
          <TextField margin="normal" fullWidth id="crewSize" label="Crew Size" name="crewSize" type="number" />
          <TextField margin="normal" fullWidth id="services" label="Services Offered" name="services" placeholder="Setup, Operation, Design consultation, etc." multiline rows={2} />
          <TextField margin="normal" fullWidth id="website" label="Website" name="website" placeholder="https://yourwebsite.com" />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Upload Service Photo:
          </Typography>
          <input type="file" name="photo" accept="image/*" style={{ marginBottom: '16px' }} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Upload Additional Photo:
          </Typography>
          <input type="file" name="additionalPhoto" accept="image/*" style={{ marginBottom: '16px' }} />
          <TextField margin="normal" fullWidth id="instagramLink" label="Instagram Link" name="instagramLink" />
          <TextField margin="normal" fullWidth id="facebookLink" label="Facebook Link" name="facebookLink" />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Registering…' : 'Register Service'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}