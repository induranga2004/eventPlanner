import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Avatar, Grid, Chip, Button, Alert, IconButton } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import InsightsIcon from '@mui/icons-material/Insights';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LockIcon from '@mui/icons-material/Lock';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import ProBadge from './ProBadge';
import UpgradeModal from './UpgradeModal';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useSubscription, useProAccess } from '../hooks/useSubscription';

// AI-themed animations for venue
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const venuePulse = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
  25% { transform: scale(1.1) rotate(2deg); opacity: 1; }
  50% { transform: scale(1.05) rotate(-1deg); opacity: 0.9; }
  75% { transform: scale(1.08) rotate(1deg); opacity: 1; }
`

// AI-themed styled components for venue (green theme)
const VenueProfileCard = styled(Paper)(({ theme }) => ({
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
    background: 'linear-gradient(-45deg, rgba(22, 160, 133, 0.6) 0%, rgba(243, 156, 18, 0.6) 25%, rgba(39, 174, 96, 0.6) 50%, rgba(230, 126, 34, 0.6) 75%, rgba(46, 204, 113, 0.6) 100%)',
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

const FloatingVenueIcon = styled(Box)(({ theme }) => ({
  animation: `${venuePulse} 4s ease-in-out infinite`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.3)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 15px 30px rgba(133, 255, 189, 0.4)',
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
    background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
    color: '#fff',
    '&:hover': {
      background: 'linear-gradient(135deg, #219a52 0%, #27ae60 100%)',
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
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [requestedFeature, setRequestedFeature] = useState('');
  
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { isPro, subscription } = useSubscription();
  const { hasProAccess } = useProAccess();

  const handleProFeatureClick = (featureName) => {
    if (!isPro) {
      setRequestedFeature(featureName);
      setUpgradeModalOpen(true);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // First, try to get user data from localStorage (set during login/2FA)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setLoading(false);
          return;
        }

        // Fallback to API call if no stored user data
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
    localStorage.removeItem('user'); // Also remove stored user data
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
        <Paper elevation={1} sx={{ mb: 3, overflow: 'hidden', position: 'relative' }}>
          <ProBadge 
            variant={isPro ? "pro" : undefined}
            size="large"
            style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
          />
          <Box sx={{ height: 160, background: 'linear-gradient(90deg,#11998e,#38ef7d)', position: 'relative' }} />
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, mt: -8 }}>
            <Avatar sx={{ width: 96, height: 96, border: '4px solid white', bgcolor: 'success.main' }}>
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h5">{user.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>{user.role} • Member since {new Date(user.createdAt).toLocaleDateString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton color="primary" onClick={() => navigate('/me')}><EditIcon /></IconButton>
                  {!isPro && (
                    <Button 
                      variant="contained"
                      onClick={() => setUpgradeModalOpen(true)}
                      sx={{ 
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.8) 0%, rgba(255, 165, 0, 0.8) 100%)',
                        color: '#000',
                        '&:hover': { background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 165, 0, 0.9) 100%)' }
                      }}
                    >
                      <StarIcon sx={{ mr: 1 }} />
                      Upgrade to Pro
                    </Button>
                  )}
                </Box>
              </Box>
              {user.venueAddress && (<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mt: 1 }}>{user.venueAddress}</Typography>)}
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
        
        {isPro && (
          <Paper elevation={1} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)' }}>
            <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ color: '#FFD700' }} />
              Pro Analytics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)' }}>
                  <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    1,247
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Profile Views This Month
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)' }}>
                  <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    34
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Event Bookings This Month
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)' }}>
                  <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    $8,750
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Revenue This Month
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        )}

        {message && (
          <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon />
            Advanced Features
            {!isPro && (
              <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)', ml: 1 }}>
                (Pro Only)
              </Typography>
            )}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Button 
                fullWidth
                variant="outlined"
                onClick={() => isPro ? navigate('/advanced-analytics') : handleProFeatureClick('Advanced Analytics')}
                sx={{ 
                  opacity: isPro ? 1 : 0.6,
                  filter: isPro ? 'none' : 'grayscale(50%)',
                  minHeight: 60
                }}
              >
                <InsightsIcon sx={{ mr: 1 }} />
                Advanced Analytics
                {!isPro && <LockIcon sx={{ ml: 1, fontSize: 16 }} />}
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button 
                fullWidth
                variant="outlined"
                onClick={() => isPro ? navigate('/priority-support') : handleProFeatureClick('Priority Support')}
                sx={{ 
                  opacity: isPro ? 1 : 0.6,
                  filter: isPro ? 'none' : 'grayscale(50%)',
                  minHeight: 60
                }}
              >
                <SupportAgentIcon sx={{ mr: 1 }} />
                Priority Support
                {!isPro && <LockIcon sx={{ ml: 1, fontSize: 16 }} />}
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                  Email
                </Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Box>
              {user.phone && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                    Phone
                  </Typography>
                  <Typography variant="body1">{user.phone}</Typography>
                </Box>
              )}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                  Role
                </Typography>
                <Chip label={user.role || 'Venue'} color="success" size="small" />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
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
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                    Venue Address
                  </Typography>
                  <Typography variant="body1">{user.venueAddress}</Typography>
                </Box>
              )}
              {user.capacity && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                    Capacity
                  </Typography>
                  <Typography variant="body1">{user.capacity} people</Typography>
                </Box>
              )}
              {(user.photo || user.additionalPhoto) && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
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
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Contact</Typography>
                <Typography variant="body1">{user.phone || 'Not provided'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Capacity</Typography>
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

      <UpgradeModal 
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        requestedFeature={requestedFeature}
      />
    </DashboardLayout>
  );
};

export default VenueDashboard;