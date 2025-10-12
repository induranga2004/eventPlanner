import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, CssBaseline, Box, Typography, TextField, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { register } from '../api/auth';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';

// AI-themed animations
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`

const pulse = keyframes`
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`

// AI-themed styled components for music band
const BackgroundContainer = styled(Box)(() => ({
  minHeight: '100vh',
  background: 'linear-gradient(-45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #667eea 75%, #764ba2 100%)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 8s ease infinite`,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px 0',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    backdropFilter: 'blur(10px)',
  }
}))

const GlassPaper = styled(Box)(() => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '40px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  position: 'relative',
  zIndex: 1,
  maxWidth: '500px',
  width: '100%',
}))

const FloatingIcon = styled(Box)(() => ({
  animation: `${float} 3s ease-in-out infinite`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '80px',
  height: '80px',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.3)',
  backdropFilter: 'blur(10px)',
  margin: '0 auto 20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px) scale(1.1)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  }
}))

const AITextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.15)',
      '& fieldset': {
        border: 'none',
      },
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.15)',
      boxShadow: '0 0 20px rgba(102, 126, 234, 0.4)',
      '& fieldset': {
        border: '2px solid rgba(102, 126, 234, 0.6)',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.9)',
    '&.Mui-focused': {
      color: '#fff',
    },
  },
  '& .MuiOutlinedInput-input': {
    color: '#fff',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
  },
  '& .MuiInputLabel-shrink': {
    color: '#fff',
  },
}))

const AIButton = styled(Button)(() => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#fff',
  borderRadius: '12px',
  padding: '12px 0',
  fontSize: '16px',
  fontWeight: 600,
  textTransform: 'none',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.7)',
  },
}))

const GradientText = styled(Typography)(() => ({
  background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 700,
  textAlign: 'center',
  marginBottom: '30px',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
}))

const FileUploadBox = styled(Box)(() => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  border: '2px dashed rgba(255, 255, 255, 0.5)',
  padding: '20px',
  textAlign: 'center',
  margin: '10px 0',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  '& input[type="file"]': {
    color: '#fff',
    width: '100%',
    '&::file-selector-button': {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '8px',
      padding: '8px 16px',
      marginRight: '10px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.2)',
      }
    }
  }
}))

export default function MusicBandRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('role', 'music_band');

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
      <CssBaseline />
      <GlassPaper>
        <FloatingIcon>
          <QueueMusicIcon sx={{ fontSize: 40, color: '#fff' }} />
        </FloatingIcon>
        
        <GradientText component="h1" variant="h4">
          Music Band Registration
        </GradientText>
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <AITextField 
            margin="normal" 
            required 
            fullWidth 
            id="bandName" 
            label="Band Name" 
            name="bandName" 
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
          <AITextField 
            margin="normal" 
            fullWidth 
            id="members" 
            label="Band Members" 
            name="members" 
            placeholder="Number of members" 
            type="number" 
          />
          <AITextField 
            margin="normal" 
            fullWidth 
            id="genres" 
            label="Music Genres" 
            name="genres" 
            placeholder="Rock, Pop, Jazz, etc." 
          />
          <AITextField 
            margin="normal" 
            fullWidth 
            id="bio" 
            label="Band Bio" 
            name="bio" 
            placeholder="Tell us about your band" 
            multiline 
            rows={3} 
          />
          
          <Typography variant="body1" sx={{ mt: 3, mb: 1, color: '#fff', fontWeight: 600 }}>
            Upload Band Photo:
          </Typography>
          <FileUploadBox>
            <input type="file" name="photo" accept="image/*" />
          </FileUploadBox>
          
          <Typography variant="body1" sx={{ mt: 2, mb: 1, color: '#fff', fontWeight: 600 }}>
            Upload Additional Photo:
          </Typography>
          <FileUploadBox>
            <input type="file" name="additionalPhoto" accept="image/*" />
          </FileUploadBox>
          
          <AITextField 
            margin="normal" 
            fullWidth 
            id="spotifyLink" 
            label="Spotify/Music Link" 
            name="spotifyLink" 
          />
          <AITextField 
            margin="normal" 
            fullWidth 
            id="youtubeLink" 
            label="YouTube Link" 
            name="youtubeLink" 
          />
          <AITextField 
            margin="normal" 
            fullWidth 
            id="instagramLink" 
            label="Instagram Link" 
            name="instagramLink" 
          />
          <AITextField 
            margin="normal" 
            fullWidth 
            id="facebookLink" 
            label="Facebook Link" 
            name="facebookLink" 
          />
          
          {error && (
            <Typography 
              sx={{ 
                mt: 2, 
                p: 2, 
                background: 'rgba(244, 67, 54, 0.1)', 
                border: '1px solid rgba(244, 67, 54, 0.3)',
                borderRadius: '8px',
                color: '#fff',
                backdropFilter: 'blur(10px)',
              }}
            >
              {error}
            </Typography>
          )}
          
          <AIButton 
            type="submit" 
            fullWidth 
            variant="contained" 
            sx={{ mt: 4, mb: 2 }} 
            disabled={loading}
          >
            {loading ? 'Registering Band...' : 'Register Band'}
          </AIButton>
        </Box>
      </GlassPaper>
    </BackgroundContainer>
  );
}