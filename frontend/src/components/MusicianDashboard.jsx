import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Avatar, Grid, Chip, Button, Link, Alert, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';

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
        {/* Profile header with banner */}
        <Paper elevation={1} sx={{ mb: 3, overflow: 'hidden' }}>
          <Box sx={{ height: 160, background: 'linear-gradient(90deg,#6a11cb,#2575fc)', position: 'relative' }} />
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, mt: -8 }}>
            <Avatar sx={{ width: 96, height: 96, border: '4px solid white', bgcolor: 'secondary.main' }}>
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
              {user.spotifyLink && (<Link href={user.spotifyLink} target="_blank" rel="noopener" sx={{ display: 'block', mt: 1 }}>{user.spotifyLink}</Link>)}
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 2 }}>
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
          <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Recent Activity</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="h6">Plays & Engagement</Typography>
                <Sparkline values={[5,7,6,10,9,12,15,11,13,16,14]} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                About
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
                <Chip label={user.role} color="secondary" size="small" />
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
                Gallery
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {user.photo && (
                  <Box component="img"
                    src={`http://localhost:4000${user.photoBgRemoved || user.photo}`}
                    alt="Primary"
                    sx={{ width: 180, height: 120, objectFit: 'cover', borderRadius: 1 }}
                  />
                )}
                {user.additionalPhoto && (
                  <Box component="img"
                    src={`http://localhost:4000${user.additionalPhotoBgRemoved || user.additionalPhoto}`}
                    alt="Additional"
                    sx={{ width: 180, height: 120, objectFit: 'cover', borderRadius: 1 }}
                  />
                )}
                {/* Placeholder tiles to encourage uploading more */}
                <Box sx={{ width: 180, height: 120, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
                  <PhotoLibraryIcon color="action" />
                </Box>
              </Box>
              {user.spotifyLink && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Spotify Profile
                  </Typography>
                  <Link href={user.spotifyLink} target="_blank" rel="noopener">
                    {user.spotifyLink}
                  </Link>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Contact & Booking</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Contact</Typography>
                <Typography variant="body1">{user.phone || 'Not provided'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Booking Link</Typography>
                <Button startIcon={<CalendarTodayIcon />} size="small" variant="contained" onClick={() => navigate('/me')}>Open Calendar</Button>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Quick Actions</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button variant="outlined" size="small" onClick={() => navigate('/me')}>Edit Profile</Button>
                  <Button variant="contained" size="small" onClick={() => navigate('/me')}>Promote Gig</Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
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
                  color="primary"
                  onClick={() => navigate('/me')}
                  sx={{ 
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
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
                  color="primary"
                  sx={{ 
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: 'primary.50'
                    }
                  }}
                >
                  Manage Gigs
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
                  Update Portfolio
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

export default MusicianDashboard;