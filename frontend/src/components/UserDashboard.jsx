import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Avatar, Grid, Chip, Button, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import ProBadge from './ProBadge';
import UpgradeModal from './UpgradeModal';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useSubscription, useProAccess } from '../hooks/useSubscription';
import EventIcon from '@mui/icons-material/Event';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import InsightsIcon from '@mui/icons-material/Insights';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LockIcon from '@mui/icons-material/Lock';

// Create Motion components
const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);
const MotionAvatar = motion.create(Avatar);
const MotionGrid = motion.create(Grid);

// Color Hunt styled components
const ProfileCard = styled(MotionPaper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1A4870 0%, #1F316F 100%)',
  border: '1px solid rgba(91, 153, 194, 0.3)',
  borderRadius: '20px',
  color: '#F9DBBA',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
}));

const InfoCard = styled(MotionPaper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1A4870 0%, #1F316F 100%)',
  border: '1px solid rgba(91, 153, 194, 0.3)',
  borderRadius: '16px',
  color: '#F9DBBA',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #5B99C2 0%, #1A4870 100%)',
  color: '#F9DBBA',
  border: '1px solid rgba(91, 153, 194, 0.4)',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  padding: '10px 24px',
  '&.MuiButton-outlined': {
    background: 'transparent',
    border: '1px solid rgba(91, 153, 194, 0.5)',
    '&:hover': {
      background: 'rgba(91, 153, 194, 0.15)',
      border: '1px solid #5B99C2',
    }
  }
}));

const ProButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  color: '#1F316F',
  borderRadius: '12px',
  fontWeight: 700,
  textTransform: 'none',
  padding: '10px 24px',
  '&:hover': {
    background: 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)',
    transform: 'translateY(-2px)',
  }
}));

const InfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 0',
  borderBottom: '1px solid rgba(91, 153, 194, 0.2)',
  '&:last-child': {
    borderBottom: 'none',
  }
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
        <ProfileCard 
          elevation={0} 
          sx={{ height: 180, p: 3, mb: 4, position: 'relative' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProBadge 
            variant={isPro ? "pro" : undefined}
            size="large"
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <MotionAvatar 
              src={user.photo} 
              sx={{ 
                width: 100, 
                height: 100,
                border: '3px solid rgba(91, 153, 194, 0.5)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </MotionAvatar>
            <Box sx={{ ml: 3, flex: 1 }}>
              <Typography variant="h4" sx={{ color: '#F9DBBA', fontWeight: 700 }}>
                {user.name}
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(249, 219, 186, 0.8)', mt: 1 }}>
                Event Planner
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <EventIcon sx={{ color: '#5B99C2' }} />
                <Typography variant="body2" sx={{ color: '#F9DBBA' }}>
                  Creating memorable experiences
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <ActionButton 
                variant="contained" 
                size="large"
                onClick={() => navigate('/planner')}
                component={motion.button}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlaylistAddCheckRoundedIcon sx={{ mr: 1 }} />
                Plan an event
              </ActionButton>
              <ActionButton 
                variant="contained" 
                size="large"
                component={motion.button}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Edit Profile
              </ActionButton>
              {(!isPro && subscription && !subscription.loading) && (
                <ProButton 
                  variant="contained"
                  onClick={() => setUpgradeModalOpen(true)}
                  component={motion.button}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <StarIcon sx={{ mr: 1 }} />
                  Upgrade to Pro
                </ProButton>
              )}
            </Box>
          </Box>
        </ProfileCard>

        <Fade in={mounted} timeout={600}>
          <Box>
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <MotionGrid item xs={12} sm={6} md={3}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <StatCard title="Status" value="Active" subtitle="Account" color="success" />
                </MotionGrid>
                <MotionGrid item xs={12} sm={6} md={3}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <StatCard title="Member Since" value={new Date(user.createdAt).toLocaleDateString()} subtitle="" />
                </MotionGrid>
                <MotionGrid item xs={12} sm={6} md={3}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <StatCard title="Role" value={user.role || 'User'} subtitle="Current" />
                </MotionGrid>
                <MotionGrid item xs={12} sm={6} md={3}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <StatCard title="Profile" value={user.name || 'N/A'} subtitle={user.email || 'No email'} />
                </MotionGrid>
              </Grid>
            </MotionBox>

            {isPro && (
              <ProfileCard 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon sx={{ color: '#FFD700' }} />
                  <Box component="span" sx={{ color: '#F9DBBA', fontWeight: 700 }}>Pro Analytics</Box>
                </Typography>
                <Grid container spacing={3}>
                  <MotionGrid item xs={12} md={4}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <InfoCard 
                      elevation={2} 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center', 
                        background: 'linear-gradient(135deg, #5B99C2 0%, #1A4870 100%)'
                      }}
                      component={motion.div}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <Typography variant="h3" sx={{ color: '#F9DBBA', fontWeight: 'bold' }}>
                        89
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(249, 219, 186, 0.8)' }}>
                        Events Organized
                      </Typography>
                    </InfoCard>
                  </MotionGrid>
                  <MotionGrid item xs={12} md={4}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <InfoCard 
                      elevation={2} 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center', 
                        background: 'linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)'
                      }}
                      component={motion.div}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <Typography variant="h3" sx={{ color: '#F9DBBA', fontWeight: 'bold' }}>
                        4.9
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(249, 219, 186, 0.8)' }}>
                        Average Rating
                      </Typography>
                    </InfoCard>
                  </MotionGrid>
                  <MotionGrid item xs={12} md={4}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <InfoCard 
                      elevation={2} 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center', 
                        background: 'linear-gradient(135deg, #FFA726 0%, #F57C00 100%)'
                      }}
                      component={motion.div}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <Typography variant="h3" sx={{ color: '#F9DBBA', fontWeight: 'bold' }}>
                        567
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(249, 219, 186, 0.8)' }}>
                        Total Attendees
                      </Typography>
                    </InfoCard>
                  </MotionGrid>
                </Grid>
              </ProfileCard>
            )}

            <ProfileCard 
              elevation={0} 
              sx={{ p: 3, mb: 4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ color: '#5B99C2' }} />
                <Box component="span" sx={{ color: '#F9DBBA', fontWeight: 700 }}>Advanced Features</Box>
                {!isPro && (
                  <Typography variant="caption" sx={{ color: 'rgba(249, 219, 186, 0.6)', ml: 1 }}>
                    (Pro Only)
                  </Typography>
                )}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <MotionBox
                    whileHover={isPro ? { scale: 1.02, y: -2 } : {}}
                    whileTap={isPro ? { scale: 0.98 } : {}}
                  >
                    <ActionButton 
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
                    </ActionButton>
                  </MotionBox>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MotionBox
                    whileHover={isPro ? { scale: 1.02, y: -2 } : {}}
                    whileTap={isPro ? { scale: 0.98 } : {}}
                  >
                    <ActionButton 
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
                    </ActionButton>
                  </MotionBox>
                </Grid>
              </Grid>
            </ProfileCard>

            <Grid container spacing={3}>
              <MotionGrid item xs={12} md={6}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <InfoCard elevation={0} sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <PersonIcon sx={{ color: '#5B99C2', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ color: '#F9DBBA', fontWeight: 700 }}>
                      Personal Information
                    </Typography>
                  </Box>
                  
                  <InfoBox>
                    <EmailIcon sx={{ color: '#5B99C2' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(249, 219, 186, 0.8)' }}>Email</Typography>
                      <Typography variant="body1" sx={{ color: '#F9DBBA', fontWeight: 500 }}>{user.email}</Typography>
                    </Box>
                  </InfoBox>

                  {user.phone && (
                    <InfoBox>
                      <PhoneIcon sx={{ color: '#5B99C2' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(249, 219, 186, 0.8)' }}>Phone</Typography>
                        <Typography variant="body1" sx={{ color: '#F9DBBA', fontWeight: 500 }}>{user.phone}</Typography>
                      </Box>
                    </InfoBox>
                  )}

                  <InfoBox>
                    <EventIcon sx={{ color: '#5B99C2' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(249, 219, 186, 0.8)' }}>Role</Typography>
                      <Chip 
                        label={user.role || 'User'} 
                        sx={{ 
                          background: 'linear-gradient(135deg, #5B99C2 0%, #1A4870 100%)',
                          color: '#F9DBBA',
                          fontWeight: 600,
                          border: '1px solid rgba(91, 153, 194, 0.4)',
                        }} 
                        size="small" 
                      />
                    </Box>
                  </InfoBox>

                  <InfoBox>
                    <PersonIcon sx={{ color: '#5B99C2' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(249, 219, 186, 0.8)' }}>Member Since</Typography>
                      <Typography variant="body1" sx={{ color: '#F9DBBA', fontWeight: 500 }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </InfoBox>
                </InfoCard>
              </MotionGrid>

              <MotionGrid item xs={12} md={6}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                <InfoCard elevation={0} sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <EventIcon sx={{ color: '#5B99C2', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ color: '#F9DBBA', fontWeight: 700 }}>
                      Account Actions
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <MotionBox
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ActionButton 
                        variant="outlined" 
                        fullWidth
                        size="large"
                        onClick={() => navigate('/me')}
                        sx={{ justifyContent: 'flex-start', gap: 2 }}
                      >
                        <PersonIcon />
                        View Profile
                      </ActionButton>
                    </MotionBox>
                    
                    <MotionBox
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ActionButton 
                        variant="outlined" 
                        fullWidth
                        size="large"
                        onClick={handleLogout}
                        sx={{ 
                          justifyContent: 'flex-start', 
                          gap: 2,
                          border: '1px solid rgba(244, 67, 54, 0.5)',
                          color: '#F9DBBA',
                          '&:hover': {
                            background: 'rgba(244, 67, 54, 0.15)',
                            border: '1px solid rgba(244, 67, 54, 0.7)',
                          }
                        }}
                      >
                        <EventIcon />
                        Logout
                      </ActionButton>
                    </MotionBox>
                  </Box>
                </InfoCard>
              </MotionGrid>
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
