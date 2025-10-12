import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Event as EventIcon,
  MusicNote as MusicIcon,
  Stadium as VenueIcon,
  Lightbulb as LightIcon,
  VolumeUp as SoundIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// AI-themed styled components
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
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

const GlassPaper = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(4),
  maxWidth: '1400px',
  width: '100%',
  position: 'relative',
}));

const AICard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    background: 'rgba(255, 255, 255, 0.98)',
  }
}));

// Special colorful card for Event Planner (user role)
const UserCard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '20px',
  border: '2px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 12px 30px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    pointerEvents: 'none',
  },
  '&:hover': {
    transform: 'translateY(-12px) scale(1.05)',
    boxShadow: '0 25px 50px rgba(102, 126, 234, 0.4)',
    '&:before': {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
    }
  }
}));

// Colorful cards for service providers
const ServiceCard = styled(Card)(({ servicecolor }) => {
  const getGradient = () => {
    switch(servicecolor) {
      case 'secondary':
        return 'linear-gradient(135deg, #764ba2 0%, #667eea 50%, #f093fb 100%)';
      case 'success':
        return 'linear-gradient(135deg, #4caf50 0%, #2e7d32 50%, #81c784 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #ff9800 0%, #f57c00 50%, #ffb74d 100%)';
      case 'info':
        return 'linear-gradient(135deg, #2196f3 0%, #1976d2 50%, #64b5f6 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  return {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: getGradient(),
    borderRadius: '20px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: `0 10px 25px ${
      servicecolor === 'secondary' ? 'rgba(118, 75, 162, 0.3)' :
      servicecolor === 'success' ? 'rgba(76, 175, 80, 0.3)' :
      servicecolor === 'warning' ? 'rgba(255, 152, 0, 0.3)' :
      servicecolor === 'info' ? 'rgba(33, 150, 243, 0.3)' :
      'rgba(102, 126, 234, 0.3)'
    }`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      pointerEvents: 'none',
    },
    '&:hover': {
      transform: 'translateY(-10px) scale(1.03)',
      boxShadow: `0 20px 40px ${
        servicecolor === 'secondary' ? 'rgba(118, 75, 162, 0.4)' :
        servicecolor === 'success' ? 'rgba(76, 175, 80, 0.4)' :
        servicecolor === 'warning' ? 'rgba(255, 152, 0, 0.4)' :
        servicecolor === 'info' ? 'rgba(33, 150, 243, 0.4)' :
        'rgba(102, 126, 234, 0.4)'
      }`,
      '&:before': {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
      }
    }
  };
});

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/register/${role}`);
  };

  const roles = [
    {
      role: 'user',
      title: 'Event Planner',
      description: 'Create, manage and coordinate amazing events with our premium tools',
      icon: <EventIcon sx={{ fontSize: 48 }} />,
      color: 'primary',
      features: ['🎯 Event Creation', '📋 Vendor Management', '📊 Analytics Dashboard', '💼 Professional Tools']
    },
    {
      role: 'musician',
      title: 'Musician',
      description: 'Individual music performer offering solo performances',
      icon: <MusicIcon sx={{ fontSize: 40 }} />,
      color: 'secondary',
      features: ['🎵 Solo Performances', '🎼 Music Expertise', '📸 Portfolio Showcase']
    },
    {
      role: 'music_band',
      title: 'Music Band',
      description: 'Group music performance with multiple members',
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      color: 'secondary',
      features: ['🎤 Band Performances', '🎸 Multiple Genres', '🎛️ Equipment Included']
    },
    {
      role: 'venue',
      title: 'Venue Owner',
      description: 'Provide amazing event spaces and locations',
      icon: <VenueIcon sx={{ fontSize: 40 }} />,
      color: 'success',
      features: ['🏛️ Event Spaces', '👥 Capacity Options', '📍 Prime Locations']
    },
    {
      role: 'lights',
      title: 'Lighting Services',
      description: 'Professional lighting solutions and ambiance creation',
      icon: <LightIcon sx={{ fontSize: 40 }} />,
      color: 'warning',
      features: ['💡 LED Systems', '🎭 Stage Lighting', '✨ Event Ambiance']
    },
    {
      role: 'sounds',
      title: 'Sound Services',
      description: 'Audio equipment and professional sound mixing',
      icon: <SoundIcon sx={{ fontSize: 40 }} />,
      color: 'info',
      features: ['🔊 PA Systems', '🎚️ Sound Mixing', '🎧 Audio Equipment']
    }
  ];

  const RoleCard = ({ role, title, description, icon, color, features }) => {
    const CardComponent = role === 'user' ? UserCard : ServiceCard;
    
    return (
      <CardComponent servicecolor={color}>
        <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            mb: 2,
            '& .MuiSvgIcon-root': {
              background: role === 'user' 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)'
                : 'rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '16px',
              color: role === 'user' ? '#667eea !important' : 'white !important',
              boxShadow: role === 'user' 
                ? '0 8px 20px rgba(255,255,255,0.3)' 
                : '0 8px 20px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(10px)',
              border: role === 'user' 
                ? '2px solid rgba(255,255,255,0.8)' 
                : '2px solid rgba(255,255,255,0.3)',
            }
          }}>
            {icon}
          </Box>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: role === 'user' ? 900 : 800,
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              mb: 2
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3, 
              fontWeight: 600,
              color: 'rgba(255,255,255,0.95)',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              fontSize: role === 'user' ? '1.1rem' : '1rem'
            }}
          >
            {description}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {features.map((feature, index) => (
              <Chip 
                key={index} 
                label={feature} 
                size="small" 
                sx={{
                  background: role === 'user'
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  border: role === 'user'
                    ? '1px solid rgba(255, 255, 255, 0.8)'
                    : '1px solid rgba(255, 255, 255, 0.4)',
                  color: role === 'user' ? '#667eea' : 'white',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  '&:hover': {
                    background: role === 'user'
                      ? 'rgba(255, 255, 255, 1)'
                      : 'rgba(255, 255, 255, 0.35)',
                  }
                }}
              />
            ))}
          </Box>
        </CardContent>
        <CardActions sx={{ p: 3, pt: 0, position: 'relative', zIndex: 1 }}>
          <Button 
            fullWidth 
            variant="contained" 
            onClick={() => handleRoleSelect(role)}
            sx={{ 
              py: 2,
              fontWeight: 900,
              textTransform: 'none',
              fontSize: '1.1rem',
              borderRadius: '16px',
              background: role === 'user'
                ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)'
                : 'rgba(255, 255, 255, 0.2)',
              color: role === 'user' ? '#667eea' : 'white',
              border: role === 'user'
                ? '2px solid rgba(255,255,255,0.9)'
                : '2px solid rgba(255,255,255,0.4)',
              backdropFilter: 'blur(10px)',
              boxShadow: role === 'user'
                ? '0 6px 20px rgba(255,255,255,0.4)'
                : '0 6px 20px rgba(0,0,0,0.3)',
              '&:hover': {
                transform: 'translateY(-3px)',
                background: role === 'user'
                  ? 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 100%)'
                  : 'rgba(255, 255, 255, 0.3)',
                boxShadow: role === 'user'
                  ? '0 8px 25px rgba(255,255,255,0.5)'
                  : '0 8px 25px rgba(0,0,0,0.4)',
              }
            }}
          >
            {role === 'user' ? '🎯 Start Planning Events' : `🚀 Join as ${title}`}
          </Button>
        </CardActions>
      </CardComponent>
    );
  };

  return (
    <BackgroundContainer>
      <GlassPaper>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Choose Your Professional Path
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.85)',
                mb: 4,
                fontWeight: 500,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Join our elite network of event professionals and unlock unlimited opportunities
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 2,
              mb: 4
            }}>
              <CheckCircleIcon sx={{ color: '#4caf50', fontSize: '1.5rem' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Trusted by 10,000+ professionals worldwide
              </Typography>
            </Box>
          </Box>

          {/* Event Planner Section */}
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              textAlign="center"
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 4
              }}
            >
              🎯 Are You Planning an Event?
            </Typography>
            <Grid container justifyContent="center">
              <Grid item xs={12} sm={8} md={6}>
                <RoleCard {...roles[0]} />
              </Grid>
            </Grid>
          </Box>

          {/* Service Providers Section */}
          <Box>
            <Typography 
              variant="h4" 
              component="h2" 
              textAlign="center"
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 4
              }}
            >
              🚀 Or Are You a Service Provider?
            </Typography>
            <Grid container spacing={4}>
              {roles.slice(1).map((role) => (
                <Grid item xs={12} sm={6} md={4} key={role.role}>
                  <RoleCard {...role} />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box textAlign="center" sx={{ mt: 4 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Already have an account?{' '}
              <Button 
                component={Link} 
                to="/signin" 
                variant="text"
                sx={{ 
                  fontWeight: 700,
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Sign In
              </Button>
            </Typography>
          </Box>
        </Container>
      </GlassPaper>
    </BackgroundContainer>
  );
}