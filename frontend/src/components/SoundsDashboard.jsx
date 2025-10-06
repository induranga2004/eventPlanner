import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Avatar, Grid, Chip, Button, Fade } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import MicIcon from '@mui/icons-material/Mic';
import SpeakerIcon from '@mui/icons-material/Speaker';

// AI-themed animations for sounds
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const soundWave = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
  25% { transform: scale(1.2) rotate(3deg); opacity: 1; }
  50% { transform: scale(1.1) rotate(-2deg); opacity: 0.9; }
  75% { transform: scale(1.15) rotate(1deg); opacity: 1; }
`

// AI-themed styled components for sounds (blue theme)
const SoundsProfileCard = styled(Paper)(({ theme }) => ({
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
    background: 'linear-gradient(-45deg, rgba(79, 172, 254, 0.3) 0%, rgba(0, 242, 254, 0.3) 25%, rgba(79, 172, 254, 0.3) 50%, rgba(0, 242, 254, 0.3) 75%, rgba(79, 172, 254, 0.3) 100%)',
    backgroundSize: '400% 400%',
    animation: `${gradientShift} 10s ease infinite`,
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

const FloatingSoundIcon = styled(Box)(({ theme }) => ({
  animation: `${soundWave} 3s ease-in-out infinite`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.3)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 15px 30px rgba(79, 172, 254, 0.4)',
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
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#fff',
    '&:hover': {
      background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
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

export default function SoundsDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try { const data = await me(); setUser(data.user); } catch { navigate('/login'); } finally { setLoading(false); }
    })();
  }, [navigate]);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, []);

  if (loading) return <Container><Typography>Loading...</Typography></Container>;
  if (!user) return <Container><Typography>User not found</Typography></Container>;

  return (
  <DashboardLayout title="Sound Services Dashboard" navItems={[{ label: 'Profile', to: '/me' }]} role="sounds"> 
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{
          height: 140,
          borderRadius: 2,
          overflow: 'hidden',
          mb: 3,
          background: 'linear-gradient(120deg, rgba(14,165,233,0.95) 0%, rgba(2,132,199,0.95) 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          p: 3,
        }}>
          <Avatar sx={{ width: 84, height: 84, mr: 2, bgcolor: 'info.main' }}>{user.companyName?.charAt(0)?.toUpperCase() || user.name?.charAt(0)?.toUpperCase()}</Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{user.companyName || user.name}</Typography>
            <Typography variant="body2">Sound & Audio Services</Typography>
          </Box>
          <Box flex={1} />
          <Button variant="contained" color="secondary">Manage</Button>
        </Box>

        <Fade in={mounted} timeout={420}>
          <Box>
            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Gigs" value="—" subtitle="This month" /></Grid>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Equipment" value={user.equipmentDetails ? 'Listed' : '—'} subtitle="Inventory" /></Grid>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Services" value={user.services ? 'Listed' : '—'} subtitle="Offered" /></Grid>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Since" value={new Date(user.createdAt).toLocaleDateString()} /></Grid>
            </Grid>

            <Paper elevation={3} sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 3 }}>
                    <Typography variant="h6">Equipment</Typography>
                    <Typography variant="body2" color="text.secondary">Inventory</Typography>
                    <Typography>{user.equipmentDetails || '—'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 3 }}>
                    <Typography variant="h6">Quick Actions</Typography>
                    <Button variant="contained" onClick={() => navigate('/me')}>Manage Sound</Button>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </DashboardLayout>
  );
}
