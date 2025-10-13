import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Avatar, Grid, Chip, Button, Link, Alert, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import AlbumIcon from '@mui/icons-material/Album';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import ProBadge from './ProBadge';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

// Create Motion components
const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);
const MotionGrid = motion.create(Grid);

// Premium Profile Card with Color Hunt + Gold accents
const PremiumProfileCard = styled(MotionPaper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1A4870 0%, #1F316F 100%)',
  border: '2px solid rgba(255, 215, 0, 0.4)',
  borderRadius: '24px',
  color: '#F9DBBA',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)',
}));

// Enhanced analytics card for Pro users
const AnalyticsCard = styled(MotionPaper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1A4870 0%, #1F316F 100%)',
  border: '1px solid rgba(91, 153, 194, 0.3)',
  borderRadius: '16px',
  color: '#F9DBBA',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
}));

// Premium stat display with Color Hunt palette
const PremiumStatCard = ({ title, value, subtitle, icon, trend, color = 'primary' }) => (
  <AnalyticsCard 
    elevation={0} 
    sx={{ p: 3, height: '100%' }}
    component={motion.div}
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <Box display="flex" alignItems="center" gap={2} mb={2}>
      <MotionBox 
        sx={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(255,215,0,0.3) 0%, rgba(255,165,0,0.3) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFD700',
          border: '1px solid rgba(255, 215, 0, 0.4)'
        }}
        whileHover={{ rotate: 5, scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        {icon}
      </MotionBox>
      <ProBadge variant="premium" size="small" />
    </Box>
    
    <Typography variant="overline" sx={{ color: 'rgba(249, 219, 186, 0.9)', fontWeight: 600 }}>
      {title}
    </Typography>
    
    <Box display="flex" alignItems="baseline" gap={1}>
      <Typography variant="h3" sx={{ 
        color: '#F9DBBA', 
        fontWeight: 700,
      }}>
        {value}
      </Typography>
      {trend && (
        <Box display="flex" alignItems="center" sx={{ color: trend > 0 ? '#4caf50' : '#f44336' }}>
          <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="caption" fontWeight={600}>
            {trend > 0 ? '+' : ''}{trend}%
          </Typography>
        </Box>
      )}
    </Box>
    
    {subtitle && (
      <Typography variant="caption" sx={{ color: 'rgba(249, 219, 186, 0.8)' }}>
        {subtitle}
      </Typography>
    )}
  </AnalyticsCard>
)

// Revenue chart component with Color Hunt
const RevenueChart = () => (
  <AnalyticsCard 
    elevation={0} 
    sx={{ p: 3 }}
    component={motion.div}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 0.6 }}
  >
    <Box display="flex" alignItems="center" gap={2} mb={3}>
      <ProBadge variant="premium" size="small" />
      <Typography variant="h6" sx={{ color: '#F9DBBA', fontWeight: 700 }}>
        Revenue Analytics
      </Typography>
    </Box>
    
    <Box sx={{ 
      height: 200, 
      background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.1) 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(255,215,0,0.3)'
    }}>
      <Typography sx={{ color: 'rgba(249, 219, 186, 0.7)' }}>
        Advanced analytics charts would be here
      </Typography>
    </Box>
  </AnalyticsCard>
)

const MusicianProDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { isPro, hasFeature } = useSubscription();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setLoading(false);
          return;
        }

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

  if (loading) return <Container><Typography>Loading...</Typography></Container>;
  if (!user) return <Container><Typography>User not found</Typography></Container>;

  // Mock data for Pro features
  const mockAnalytics = {
    monthlyEarnings: 2450,
    totalPlays: 15420,
    followers: 1250,
    engagement: 8.5,
    bookings: 12,
    rating: 4.8
  };

  return (
    <DashboardLayout title="Pro Musician Dashboard" navItems={[{ label: 'Profile', to: '/me' }]} role="musician">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Premium Profile Header */}
        <PremiumProfileCard 
          elevation={0} 
          sx={{ p: 4, mb: 4, position: 'relative' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ProBadge 
            variant="premium" 
            size="large"
            position={{ top: '24px', right: '24px' }}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Box sx={{ position: 'relative' }}>
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Avatar 
                  src={user.photo} 
                  sx={{ 
                    width: 120, 
                    height: 120,
                    border: '4px solid rgba(255,215,0,0.5)',
                    boxShadow: '0 0 30px rgba(255,215,0,0.3)'
                  }}
                >
                  {user.name?.charAt(0)?.toUpperCase()}
                </Avatar>
              </motion.div>
              <VerifiedIcon sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                color: '#FFD700',
                bgcolor: '#1F316F',
                borderRadius: '50%',
                p: 0.5,
                fontSize: 28
              }} />
            </Box>
            
            <Box sx={{ ml: 4, flex: 1 }}>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Typography variant="h3" sx={{ 
                  color: '#F9DBBA', 
                  fontWeight: 700,
                }}>
                  {user.name}
                </Typography>
                <ProBadge variant="verified" size="medium" />
              </Box>
              
              <Typography variant="h6" sx={{ color: 'rgba(249, 219, 186, 0.9)', mb: 2 }}>
                🎵 Premium {user.role} • Verified Artist
              </Typography>
              
              <Box display="flex" alignItems="center" gap={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PeopleIcon sx={{ color: '#5B99C2' }} />
                  <Typography sx={{ color: 'rgba(249, 219, 186, 0.9)' }}>
                    {mockAnalytics.followers} followers
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <AudiotrackIcon sx={{ color: '#5B99C2' }} />
                  <Typography sx={{ color: 'rgba(249, 219, 186, 0.9)' }}>
                    {mockAnalytics.totalPlays} total plays
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <MotionBox whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="contained"
                onClick={() => navigate('/me')}
                sx={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#1F316F',
                  fontWeight: 700,
                  borderRadius: '12px',
                  px: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)'
                  }
                }}
              >
                <EditIcon sx={{ mr: 1 }} />
                Manage Profile
              </Button>
            </MotionBox>
          </Box>
        </PremiumProfileCard>

        {/* Premium Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <MotionGrid item xs={12} sm={6} md={3}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <PremiumStatCard 
              title="Monthly Earnings" 
              value={`$${mockAnalytics.monthlyEarnings}`}
              subtitle="This month"
              icon={<AttachMoneyIcon />}
              trend={12.5}
            />
          </MotionGrid>
          <MotionGrid item xs={12} sm={6} md={3}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <PremiumStatCard 
              title="Total Plays" 
              value={mockAnalytics.totalPlays.toLocaleString()}
              subtitle="All time"
              icon={<AudiotrackIcon />}
              trend={8.2}
            />
          </MotionGrid>
          <MotionGrid item xs={12} sm={6} md={3}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <PremiumStatCard 
              title="Bookings" 
              value={mockAnalytics.bookings}
              subtitle="This month"
              icon={<CalendarTodayIcon />}
              trend={15.3}
            />
          </MotionGrid>
          <MotionGrid item xs={12} sm={6} md={3}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <PremiumStatCard 
              title="Rating" 
              value={mockAnalytics.rating}
              subtitle="Average"
              icon={<VerifiedIcon />}
              trend={2.1}
            />
          </MotionGrid>
        </Grid>

        {/* Enhanced Analytics Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <RevenueChart />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <AnalyticsCard 
              elevation={0} 
              sx={{ p: 3, mb: 3 }}
              component={motion.div}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <ProBadge variant="premium" size="small" />
                <Typography variant="h6" sx={{ color: '#F9DBBA', fontWeight: 700 }}>
                  Pro Features
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { feature: 'Unlimited uploads', enabled: true },
                  { feature: 'Advanced analytics', enabled: true },
                  { feature: 'Priority support', enabled: true },
                  { feature: 'Custom branding', enabled: true },
                  { feature: 'API access', enabled: true }
                ].map((item, index) => (
                  <MotionBox 
                    key={index} 
                    display="flex" 
                    alignItems="center" 
                    gap={2}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                  >
                    <VerifiedIcon sx={{ color: '#4caf50', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: 'rgba(249, 219, 186, 0.9)' }}>
                      {item.feature}
                    </Typography>
                  </MotionBox>
                ))}
              </Box>
            </AnalyticsCard>
          </Grid>
        </Grid>

        {message && (
          <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mt: 3 }}>
            {message}
          </Alert>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default MusicianProDashboard;