import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Avatar, Grid, Chip, Button, Fade } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import ProBadge from './ProBadge';
import UpgradeModal from './UpgradeModal';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useSubscription, useProAccess } from '../hooks/useSubscription';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import InsightsIcon from '@mui/icons-material/Insights';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LockIcon from '@mui/icons-material/Lock';

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

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.4); }
  50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.8), 0 0 40px rgba(118, 75, 162, 0.6); }
`

// AI-themed styled components
const AIProfileCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  color: '#fff',
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
    background: 'linear-gradient(-45deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 25%, rgba(240, 147, 251, 0.3) 50%, rgba(245, 87, 108, 0.3) 75%, rgba(79, 172, 254, 0.3) 100%)',
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

const FloatingAvatar = styled(Avatar)(({ theme }) => ({
  animation: `${float} 4s ease-in-out infinite, ${glow} 3s ease-in-out infinite`,
  border: '3px solid rgba(255,255,255,0.3)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
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
  '&.MuiButton-containedSecondary': {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '&:hover': {
      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
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

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 700,
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
}))

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [requestedFeature, setRequestedFeature] = useState('');
  const navigate = useNavigate();
  const { isPro, subscription } = useSubscription();
  const { hasProAccess } = useProAccess();

  console.log('=== UserDashboard Debug Info ===');
  console.log('isPro:', isPro);
  console.log('subscription:', subscription);
  console.log('hasProAccess():', hasProAccess ? hasProAccess() : 'N/A');
  console.log('subscription.plan:', subscription?.plan);
  console.log('subscription.status:', subscription?.status);
  console.log('subscription.loading:', subscription?.loading);

  const handleProFeatureClick = (featureName) => {
    if (!isPro) {
      setRequestedFeature(featureName);
      setUpgradeModalOpen(true);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Add detailed logging
        console.log('=== UserDashboard: Starting data fetch ===');
        console.log('Token exists:', !!localStorage.getItem('token'));
        console.log('UserRole in localStorage:', localStorage.getItem('userRole'));
        
        // First, try to get user data from localStorage (set during login/2FA)
        const storedUser = localStorage.getItem('user');
        console.log('Stored user raw:', storedUser);
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('UserDashboard: Using stored user data:', userData);
          console.log('User has name?', !!userData.name);
          console.log('User has photo?', !!userData.photo);
          console.log('User has email?', !!userData.email);
          setUser(userData);
          setLoading(false);
          return;
        }

        // Fallback to API call if no stored user data
        console.log('UserDashboard: No stored data, fetching from API...');
        const data = await me();
        console.log('UserDashboard: API response:', data);
        console.log('UserDashboard: API user data:', data.user);
        setUser(data.user);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
        console.error('Error response:', error.response?.data);
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
    localStorage.removeItem('user'); // Also remove stored user data
    navigate('/login');
  };

  if (loading) return <Container><Typography>Loading...</Typography></Container>;
  if (!user) return <Container><Typography>User not found</Typography></Container>;

  console.log('UserDashboard: Rendering with user:', user);

  return (
  <DashboardLayout title="User Dashboard" navItems={[{ label: 'Profile', to: '/me' }]} role="user"> 
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <AIProfileCard elevation={0} sx={{ height: 180, p: 3, mb: 4, position: 'relative' }}>
          <ProBadge 
            variant={isPro ? "pro" : undefined}
            size="large"
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <FloatingAvatar src={user.photo} sx={{ width: 100, height: 100 }}>
              {user.name?.charAt(0)?.toUpperCase()}
            </FloatingAvatar>
            <Box sx={{ ml: 3, flex: 1 }}>
              <GradientText variant="h4">{user.name}</GradientText>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
                Event Planner
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <EventIcon sx={{ color: 'rgba(255,255,255,0.95)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Creating memorable experiences
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <AIButton variant="contained" color="secondary" size="large">
                Edit Profile
              </AIButton>
              {(!isPro && subscription && !subscription.loading) && (
                <AIButton 
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
                </AIButton>
              )}
            </Box>
          </Box>
        </AIProfileCard>

        <Fade in={mounted} timeout={600}>
          <Box>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Status" value="Active" subtitle="Account" color="success" /></Grid>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Member Since" value={new Date(user.createdAt).toLocaleDateString()} subtitle="" /></Grid>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Role" value={user.role || 'User'} subtitle="Current" /></Grid>
              <Grid item xs={12} sm={6} md={3}><StatCard title="Profile" value={user.name || 'N/A'} subtitle={user.email || 'No email'} /></Grid>
            </Grid>

            {isPro && (
              <AIProfileCard elevation={0} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)' }}>
                <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon sx={{ color: '#FFD700' }} />
                  <GradientText>Pro Analytics</GradientText>
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <AIProfileCard elevation={2} sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)' }}>
                      <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
                        89
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Events Organized
                      </Typography>
                    </AIProfileCard>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <AIProfileCard elevation={2} sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)' }}>
                      <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
                        4.9
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Average Rating
                      </Typography>
                    </AIProfileCard>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <AIProfileCard elevation={2} sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)' }}>
                      <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
                        567
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Total Attendees
                      </Typography>
                    </AIProfileCard>
                  </Grid>
                </Grid>
              </AIProfileCard>
            )}

            <AIProfileCard elevation={0} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ color: '#fff' }} />
                <GradientText>Advanced Features</GradientText>
                {!isPro && (
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', ml: 1 }}>
                    (Pro Only)
                  </Typography>
                )}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <AIButton 
                    fullWidth
                    variant="outlined"
                    onClick={() => isPro ? navigate('/event-analytics') : handleProFeatureClick('Event Analytics')}
                    sx={{ 
                      opacity: isPro ? 1 : 0.6,
                      filter: isPro ? 'none' : 'grayscale(50%)',
                      minHeight: 60
                    }}
                  >
                    <InsightsIcon sx={{ mr: 1 }} />
                    Event Analytics
                    {!isPro && <LockIcon sx={{ ml: 1, fontSize: 16 }} />}
                  </AIButton>
                </Grid>
                <Grid item xs={12} md={6}>
                  <AIButton 
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
                  </AIButton>
                </Grid>
              </Grid>
            </AIProfileCard>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <GlassCard elevation={0} sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <PersonIcon sx={{ color: '#fff', fontSize: 28 }} />
                    <GradientText variant="h6">Personal Information</GradientText>
                  </Box>
                  
                  <InfoBox>
                    <EmailIcon sx={{ color: 'rgba(255,255,255,0.95)' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Email</Typography>
                      <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>{user.email}</Typography>
                    </Box>
                  </InfoBox>

                  {user.phone && (
                    <InfoBox>
                      <PhoneIcon sx={{ color: 'rgba(255,255,255,0.95)' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Phone</Typography>
                        <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>{user.phone}</Typography>
                      </Box>
                    </InfoBox>
                  )}

                  <InfoBox>
                    <EventIcon sx={{ color: 'rgba(255,255,255,0.95)' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Role</Typography>
                      <Chip 
                        label={user.role || 'User'} 
                        sx={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          fontWeight: 600,
                          border: '1px solid rgba(255,255,255,0.3)',
                        }} 
                        size="small" 
                      />
                    </Box>
                  </InfoBox>

                  <InfoBox>
                    <PersonIcon sx={{ color: 'rgba(255,255,255,0.95)' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Member Since</Typography>
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
                    <EventIcon sx={{ color: '#fff', fontSize: 28 }} />
                    <GradientText variant="h6">Account Actions</GradientText>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <AIButton 
                      variant="outlined" 
                      fullWidth
                      size="large"
                      onClick={() => navigate('/me')}
                      sx={{ justifyContent: 'flex-start', gap: 2 }}
                    >
                      <PersonIcon />
                      View Profile
                    </AIButton>
                    
                    <AIButton 
                      variant="outlined" 
                      fullWidth
                      size="large"
                      onClick={handleLogout}
                      sx={{ 
                        justifyContent: 'flex-start', 
                        gap: 2,
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.3) 0%, rgba(244, 67, 54, 0.2) 100%)',
                        }
                      }}
                    >
                      <EventIcon />
                      Logout
                    </AIButton>
                  </Box>
                </GlassCard>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>

      <UpgradeModal 
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        requestedFeature={requestedFeature}
      />
    </DashboardLayout>
  );
};

export default UserDashboard;
