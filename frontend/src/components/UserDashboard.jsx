import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Avatar, Grid, Chip, Button, Fade } from '@mui/material';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  if (loading) return <Container><Typography>Loading...</Typography></Container>;
  if (!user) return <Container><Typography>User not found</Typography></Container>;

  return (
  <DashboardLayout title="User Dashboard" navItems={[{ label: 'Profile', to: '/me' }]} role="user"> 
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{
          height: 160,
          borderRadius: 2,
          overflow: 'hidden',
          mb: 3,
          background: 'linear-gradient(120deg, rgba(33,150,243,0.95) 0%, rgba(26,35,126,0.95) 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          p: 3,
        }}>
          <Avatar src={user.photo} sx={{ width: 96, height: 96, border: '3px solid rgba(255,255,255,0.12)' }}>
            {user.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box ml={3}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{user.name}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>{user.role}</Typography>
          </Box>
          <Box flex={1} />
          <Button variant="contained" color="secondary">Edit Profile</Button>
        </Box>

        <Fade in={mounted} timeout={420}>
          <Box>
            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Status" value="Active" subtitle="Account" color="success" /></Grid>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Member Since" value={new Date(user.createdAt).toLocaleDateString()} subtitle="" /></Grid>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Role" value={user.role} subtitle="Current" /></Grid>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Profile" value={user.name} subtitle={user.email} /></Grid>
            </Grid>

            <Paper elevation={3} sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Personal Information</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{user.email}</Typography>
                    </Box>
                    {user.phone && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Phone</Typography>
                        <Typography variant="body1">{user.phone}</Typography>
                      </Box>
                    )}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Role</Typography>
                      <Chip label={user.role} color="primary" size="small" />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Member Since</Typography>
                      <Typography variant="body1">{new Date(user.createdAt).toLocaleDateString()}</Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Account Actions</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button variant="outlined" onClick={() => navigate('/me')}>View Profile</Button>
                      <Button variant="outlined" color="error" onClick={handleLogout}>Logout</Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </DashboardLayout>
  );
};

export default UserDashboard;
