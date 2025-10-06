import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Avatar, Grid, Chip, Button, Fade } from '@mui/material';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export default function MusicBandDashboard() {
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
  <DashboardLayout title="Music Band Dashboard" navItems={[{ label: 'Profile', to: '/me' }]} role="music_band"> 
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{
          height: 140,
          borderRadius: 2,
          overflow: 'hidden',
          mb: 3,
          background: 'linear-gradient(120deg, rgba(99,102,241,0.95) 0%, rgba(79,70,229,0.95) 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          p: 3,
        }}>
          <Avatar sx={{ width: 84, height: 84, mr: 2, bgcolor: 'secondary.main' }}>{user.name?.charAt(0)?.toUpperCase()}</Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{user.name}</Typography>
            <Typography variant="body2">{(user.genres || 'Band').toString()}</Typography>
          </Box>
          <Box flex={1} />
          <Button variant="contained" color="secondary">Edit Band</Button>
        </Box>

        <Fade in={mounted} timeout={420}>
          <Box>
            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Gigs" value="—" subtitle="This month" /></Grid>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Members" value={user.members || '—'} subtitle="Total" /></Grid>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Genres" value={user.genres || '—'} subtitle="Primary" /></Grid>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Since" value={new Date(user.createdAt).toLocaleDateString()} /></Grid>
            </Grid>

            <Paper elevation={3} sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 3 }}>
                    <Typography variant="h6">Band Info</Typography>
                    <Typography variant="body2" color="text.secondary">Members</Typography>
                    <Typography>{user.members || '—'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 3 }}>
                    <Typography variant="h6">Booking</Typography>
                    <Button variant="contained" onClick={() => navigate('/me')}>Manage Bookings</Button>
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
