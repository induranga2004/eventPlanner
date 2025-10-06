import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Avatar, Grid, Chip, Button, Alert, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const Sparkline = ({ values = [], color = '#2e7d32', width = 100, height = 28 }) => {
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

const VenueDashboard = () => {
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
  <DashboardLayout title="Venue Dashboard" navItems={[{ label: 'Profile', to: '/me' }]} role="venue"> 
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Profile header with banner */}
        <Paper elevation={1} sx={{ mb: 3, overflow: 'hidden' }}>
          <Box sx={{ height: 160, background: 'linear-gradient(90deg,#11998e,#38ef7d)', position: 'relative' }} />
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, mt: -8 }}>
            <Avatar sx={{ width: 96, height: 96, border: '4px solid white', bgcolor: 'success.main' }}>
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h5">{user.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user.role} • Member since {new Date(user.createdAt).toLocaleDateString()}</Typography>
                </Box>
                <Box>
                  <IconButton color="primary" onClick={() => navigate('/me')}><EditIcon /></IconButton>
                </Box>
              </Box>
              {user.venueAddress && (<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{user.venueAddress}</Typography>)}
            </Box>
          </Box>
        </Paper>

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
                Photos & Venue Info
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

          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Contact & Bookings</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Contact</Typography>
                <Typography variant="body1">{user.phone || 'Not provided'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Capacity</Typography>
                <Typography variant="body1">{user.capacity || '—'} people</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button startIcon={<CalendarTodayIcon />} size="small" variant="contained" onClick={() => navigate('/me')}>Open Calendar</Button>
                <Sparkline values={[1,2,1,3,4,6,5,7,6,8]} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Venue Management</Typography>
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
                {/* Background removal feature removed - replaced with View Full Profile / Manage actions */}
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={() => navigate('/me')}
                >
                  View Full Profile
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
      </Container>
    </DashboardLayout>
  );
};

export default VenueDashboard;