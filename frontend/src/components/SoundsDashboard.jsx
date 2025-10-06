import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Avatar, Grid, Chip, Button, Fade } from '@mui/material';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';

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
