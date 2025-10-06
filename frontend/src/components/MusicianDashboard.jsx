import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Avatar, Grid, Chip, Button, Link, Alert, IconButton } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import AlbumIcon from '@mui/icons-material/Album';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';

// AI-themed animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const musicPulse = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
  25% { transform: scale(1.1) rotate(5deg); opacity: 1; }
  50% { transform: scale(1.05) rotate(-3deg); opacity: 0.9; }
  75% { transform: scale(1.08) rotate(2deg); opacity: 1; }
`

// AI-themed styled components for musician
const MusicianProfileCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  animation: `${float} 6s ease-in-out infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(-45deg, rgba(168, 237, 234, 0.3) 0%, rgba(254, 214, 227, 0.3) 25%, rgba(210, 153, 194, 0.3) 50%, rgba(254, 249, 215, 0.3) 75%, rgba(168, 230, 207, 0.3) 100%)',
    backgroundSize: '400% 400%',
    animation: `${gradientShift} 12s ease infinite`,
    zIndex: -1,
  }
}))

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  }
}))

const FloatingMusicIcon = styled(Box)(({ theme }) => ({
  animation: `${musicPulse} 4s ease-in-out infinite`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.3)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1) rotate(10deg)',
    boxShadow: '0 15px 30px rgba(168, 237, 234, 0.4)',
  }
}))

const AIButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
  color: '#fff',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
  },
  '&.MuiButton-contained': {
    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    color: '#333',
    '&:hover': {
      background: 'linear-gradient(135deg, #fed6e3 0%, #a8edea 100%)',
    }
  }
}))

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 700,
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
}))

const PhotoGallery = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap',
  '& img': {
    borderRadius: '12px',
    border: '2px solid rgba(255,255,255,0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05) rotate(2deg)',
      boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
    }
  }
}))

const InfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 0',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  '&:last-child': {
    borderBottom: 'none',
  }
}))

// Small inline sparkline to visualize recent activity
const Sparkline = ({ values = [], color = '#1976d2', width = 100, height = 28 }) => {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
};

const MusicianDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await me();
        setUser(data.user);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // Background removal feature removed. No reprocess handlers.

  if (loading) {
    return <Container><Typography>Loading...</Typography></Container>;
  }

  if (!user) {
    return <Container><Typography>User not found</Typography></Container>;
  }

  return (
    <DashboardLayout title="Musician Dashboard" navItems={[{ label: 'Profile', to: '/me' }]} role="musician"> 
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* AI-enhanced profile header */}
        <MusicianProfileCard elevation={0} sx={{ mb: 4, overflow: 'hidden' }}>
          {/* Gradient banner */}
          <Box sx={{ 
            height: 140, 
            background: 'linear-gradient(-45deg, rgba(168, 237, 234, 0.8) 0%, rgba(254, 214, 227, 0.8) 25%, rgba(210, 153, 194, 0.8) 50%, rgba(254, 249, 215, 0.8) 75%, rgba(168, 230, 207, 0.8) 100%)',
            backgroundSize: '400% 400%',
            animation: `${gradientShift} 10s ease infinite`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FloatingMusicIcon sx={{ width: 60, height: 60 }}>
              <MusicNoteIcon sx={{ fontSize: 32, color: '#fff' }} />
            </FloatingMusicIcon>
          </Box>
          
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, mt: -4 }}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                border: '4px solid rgba(255,255,255,0.3)', 
                bgcolor: 'transparent',
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                animation: `${float} 5s ease-in-out infinite`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <GradientText variant="h4">{user.name}</GradientText>
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
                    🎵 {user.role} • Member since {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                  {user.spotifyLink && (
                    <Link 
                      href={user.spotifyLink} 
                      target="_blank" 
                      rel="noopener" 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 2,
                        color: '#fff',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      <AudiotrackIcon /> Spotify Profile
                    </Link>
                  )}
                </Box>
                <AIButton onClick={() => navigate('/me')}>
                  <EditIcon sx={{ mr: 1 }} />
                  Edit Profile
                </AIButton>
              </Box>
            </Box>
          </Box>
        </MusicianProfileCard>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Gigs" value="—" subtitle="This month" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Followers" value="—" subtitle="Spotify" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Profile Views" value="—" subtitle="7 days" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Member Since" value={new Date(user.createdAt).toLocaleDateString()} />
          </Grid>
        </Grid>
        
        {message && (
          <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <GlassCard elevation={0} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <FloatingMusicIcon sx={{ width: 40, height: 40 }}>
                  <QueueMusicIcon sx={{ color: '#fff' }} />
                </FloatingMusicIcon>
                <GradientText variant="h6">Recent Activity</GradientText>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Plays & Engagement
                </Typography>
                <Sparkline values={[5,7,6,10,9,12,15,11,13,16,14]} />
              </Box>
            </GlassCard>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <GlassCard elevation={0} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <FloatingMusicIcon sx={{ width: 40, height: 40 }}>
                  <MusicNoteIcon sx={{ color: '#fff' }} />
                </FloatingMusicIcon>
                <GradientText variant="h6">About</GradientText>
              </Box>
              
              <InfoBox>
                <MusicNoteIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Email</Typography>
                  <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>{user.email}</Typography>
                </Box>
              </InfoBox>

              {user.phone && (
                <InfoBox>
                  <AudiotrackIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Phone</Typography>
                    <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>{user.phone}</Typography>
                  </Box>
                </InfoBox>
              )}

              <InfoBox>
                <AlbumIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Role</Typography>
                  <Chip 
                    label={user.role} 
                    sx={{ 
                      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                      color: '#333',
                      fontWeight: 600,
                      border: '1px solid rgba(255,255,255,0.3)',
                    }} 
                    size="small" 
                  />
                </Box>
              </InfoBox>

              <InfoBox>
                <CalendarTodayIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Member Since</Typography>
                  <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </InfoBox>
            </GlassCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <GlassCard elevation={0} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <FloatingMusicIcon sx={{ width: 40, height: 40 }}>
                  <PhotoLibraryIcon sx={{ color: '#fff' }} />
                </FloatingMusicIcon>
                <GradientText variant="h6">Gallery</GradientText>
              </Box>
              
              <PhotoGallery>
                {user.photo && (
                  <Box component="img"
                    src={`http://localhost:4000${user.photoBgRemoved || user.photo}`}
                    alt="Primary"
                    sx={{ width: 160, height: 100, objectFit: 'cover' }}
                  />
                )}
                {user.additionalPhoto && (
                  <Box component="img"
                    src={`http://localhost:4000${user.additionalPhotoBgRemoved || user.additionalPhoto}`}
                    alt="Additional"
                    sx={{ width: 160, height: 100, objectFit: 'cover' }}
                  />
                )}
                <Box sx={{ 
                  width: 160, 
                  height: 100, 
                  background: 'rgba(255,255,255,0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '12px',
                  border: '2px dashed rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    borderColor: 'rgba(255,255,255,0.5)',
                  }
                }}>
                  <PhotoLibraryIcon sx={{ color: 'rgba(255,255,255,0.6)' }} />
                </Box>
              </PhotoGallery>
              
              {user.spotifyLink && (
                <Box sx={{ mt: 3 }}>
                  <InfoBox>
                    <AudiotrackIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        Spotify Profile
                      </Typography>
                      <Link href={user.spotifyLink} target="_blank" rel="noopener" sx={{ color: '#fff' }}>
                        {user.spotifyLink}
                      </Link>
                    </Box>
                  </InfoBox>
                </Box>
              )}
            </GlassCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <GlassCard elevation={0} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <FloatingMusicIcon sx={{ width: 40, height: 40 }}>
                  <CalendarTodayIcon sx={{ color: '#fff' }} />
                </FloatingMusicIcon>
                <GradientText variant="h6">Contact & Booking</GradientText>
              </Box>
              
              <InfoBox>
                <MusicNoteIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Contact</Typography>
                  <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>
                    {user.phone || 'Not provided'}
                  </Typography>
                </Box>
              </InfoBox>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>Booking Link</Typography>
                <AIButton 
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/me')}
                  sx={{ mb: 2 }}
                >
                  <CalendarTodayIcon sx={{ mr: 1 }} />
                  Open Calendar
                </AIButton>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>Quick Actions</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <AIButton variant="outlined" onClick={() => navigate('/me')}>
                    <EditIcon sx={{ mr: 1 }} />
                    Edit Profile
                  </AIButton>
                  <AIButton variant="contained" onClick={() => navigate('/me')}>
                    <AudiotrackIcon sx={{ mr: 1 }} />
                    Promote Gig
                  </AIButton>
                </Box>
              </Box>
            </GlassCard>
          </Grid>

          <Grid item xs={12}>
            <GlassCard elevation={0} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <FloatingMusicIcon sx={{ width: 40, height: 40 }}>
                  <QueueMusicIcon sx={{ color: '#fff' }} />
                </FloatingMusicIcon>
                <GradientText variant="h6">Quick Actions</GradientText>
              </Box>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 3,
              }}>
                <AIButton 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/me')}
                  sx={{ 
                    minHeight: 60,
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <MusicNoteIcon />
                  View Full Profile
                </AIButton>
                
                <AIButton 
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/me')}
                  sx={{ 
                    minHeight: 60,
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <AudiotrackIcon />
                  Manage Portfolio
                </AIButton>
                
                <AIButton 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    minHeight: 60,
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <AlbumIcon />
                  Manage Gigs
                </AIButton>
                
                <AIButton 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    minHeight: 60,
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <PhotoLibraryIcon />
                  Update Portfolio
                </AIButton>
                
                <AIButton 
                  variant="outlined" 
                  size="large"
                  onClick={handleLogout}
                  sx={{ 
                    minHeight: 60,
                    flexDirection: 'column',
                    gap: 1,
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.3) 0%, rgba(244, 67, 54, 0.2) 100%)',
                    }
                  }}
                >
                  <EditIcon />
                  Logout
                </AIButton>
              </Box>
            </GlassCard>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default MusicianDashboard;