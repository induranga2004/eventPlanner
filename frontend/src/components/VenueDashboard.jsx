import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Avatar, Grid, Chip, Button, Alert } from '@mui/material';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import { me, reprocessAdditionalPhoto, reprocessAllPhotos } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const VenueDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState(false);
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

  const handleReprocessPhotos = async () => {
    if (!user?.additionalPhoto) {
      setMessage('No additional photo to process');
      return;
    }
    
    setReprocessing(true);
    setMessage('');
    try {
      const data = await reprocessAdditionalPhoto();
      setUser(data.user);
      setMessage('Background removal completed successfully!');
    } catch (error) {
      setMessage('Failed to process photos. Please try again.');
      console.error('Reprocess error:', error);
    } finally {
      setReprocessing(false);
    }
  };

  const handleReprocessBoth = async () => {
    setReprocessing(true);
    setMessage('');
    try {
      const data = await reprocessAllPhotos();
      setUser(data.user);
      setMessage('Background removal completed for all photos!');
    } catch (error) {
      setMessage('Failed to process photos. Please try again.');
      console.error('Reprocess all error:', error);
    } finally {
      setReprocessing(false);
    }
  };

  if (loading) {
    return <Container><Typography>Loading...</Typography></Container>;
  }

  if (!user) {
    return <Container><Typography>User not found</Typography></Container>;
  }

  return (
    <DashboardLayout title="Venue Dashboard" navItems={[{ label: 'Profile', to: '/me' }]}> 
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Bookings" value="—" subtitle="This month" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Capacity" value={`${user.capacity || '—'}`} subtitle="Max" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Rating" value="—" subtitle="Average" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Member Since" value={new Date(user.createdAt).toLocaleDateString()} />
          </Grid>
        </Grid>
        {message && (
          <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'success.main' }}>
            {user.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              Welcome, {user.name}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Venue Dashboard
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Box>
              {user.phone && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">{user.phone}</Typography>
                </Box>
              )}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Role
                </Typography>
                <Chip label={user.role} color="success" size="small" />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Member Since
                </Typography>
                <Typography variant="body1">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Venue Information
              </Typography>
              {user.venueAddress && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Venue Address
                  </Typography>
                  <Typography variant="body1">{user.venueAddress}</Typography>
                </Box>
              )}
              {user.capacity && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Capacity
                  </Typography>
                  <Typography variant="body1">{user.capacity} people</Typography>
                </Box>
              )}
              {(user.photo || user.additionalPhoto) && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Photos
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {user.photo && (
                      <Box component="img"
                        src={`http://localhost:4000${user.photoBgRemoved || user.photo}`}
                        alt="Primary"
                        sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1 }}
                      />
                    )}
                    {user.additionalPhoto && (
                      <Box component="img"
                        src={`http://localhost:4000${user.additionalPhotoBgRemoved || user.additionalPhoto}`}
                        alt="Additional"
                        sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1 }}
                      />
                    )}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Venue Management
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 2,
                '& .MuiButton-root': {
                  minHeight: 48,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: 4,
                  }
                }
              }}>
                <Button 
                  variant="contained" 
                  color="success"
                  onClick={() => navigate('/me')}
                  sx={{ 
                    background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #388E3C 30%, #689F38 90%)',
                    }
                  }}
                >
                  View Full Profile
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={handleReprocessPhotos} 
                  disabled={reprocessing || !user?.additionalPhoto}
                  sx={{ 
                    background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #7B1FA2 30%, #C2185B 90%)',
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)'
                    }
                  }}
                >
                  {reprocessing ? 'Processing...' : 'Remove Background'}
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  onClick={handleReprocessBoth}
                >
                  Process All Photos
                </Button>
                <Button 
                  variant="outlined" 
                  color="success"
                  sx={{ 
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: 'success.50'
                    }
                  }}
                >
                  Manage Bookings
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary"
                  sx={{ 
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: 'primary.50'
                    }
                  }}
                >
                  Update Venue Info
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  sx={{ 
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: 'secondary.50'
                    }
                  }}
                >
                  View Calendar
                </Button>
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={handleLogout}
                  sx={{ 
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: 'error.50'
                    }
                  }}
                >
                  Logout
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        </Paper>
      </Container>
    </DashboardLayout>
  );
};

export default VenueDashboard;