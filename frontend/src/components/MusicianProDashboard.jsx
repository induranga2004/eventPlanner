import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Avatar, Grid, Chip, Button, Link, Alert, IconButton } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
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

// Enhanced animations for Pro
const premiumFloat = keyframes`
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-12px) scale(1.02); }
`

const premiumGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.2); 
  }
  50% { 
    box-shadow: 0 0 50px rgba(255, 215, 0, 0.6), 0 0 100px rgba(255, 215, 0, 0.3); 
  }
`

// Premium Profile Card with enhanced styling
const PremiumProfileCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
  backdropFilter: 'blur(25px)',
  border: '2px solid rgba(255, 215, 0, 0.3)',
  borderRadius: '24px',
  overflow: 'hidden',
  position: 'relative',
  animation: `${premiumFloat} 8s ease-in-out infinite, ${premiumGlow} 4s ease-in-out infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(-45deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 25%, rgba(255, 140, 0, 0.2) 50%, rgba(255, 69, 0, 0.2) 75%, rgba(255, 215, 0, 0.2) 100%)',
    backgroundSize: '400% 400%',
    animation: `${keyframes`0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; }`} 15s ease infinite`,
    zIndex: -1,
  }
}))

// Enhanced analytics card for Pro users
const AnalyticsCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.18)',
    transform: 'translateY(-8px)',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
  }
}))

// Premium stat display
const PremiumStatCard = ({ title, value, subtitle, icon, trend, color = 'primary' }) => (
  <AnalyticsCard elevation={0} sx={{ p: 3, height: '100%' }}>
    <Box display="flex" alignItems="center" gap={2} mb={2}>
      <Box sx={{
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(255,215,0,0.3) 0%, rgba(255,165,0,0.3) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFD700'
      }}>
        {icon}
      </Box>
      <ProBadge variant="premium" size="small" />
    </Box>
    
    <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
      {title}
    </Typography>
    
    <Box display="flex" alignItems="baseline" gap={1}>
      <Typography variant="h3" sx={{ 
        color: '#fff', 
        fontWeight: 700,
        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
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
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
        {subtitle}
      </Typography>
    )}
  </AnalyticsCard>
)

// Revenue chart component (simplified)
const RevenueChart = () => (
  <AnalyticsCard elevation={0} sx={{ p: 3 }}>
    <Box display="flex" alignItems="center" gap={2} mb={3}>
      <ProBadge variant="premium" size="small" />
      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
        Revenue Analytics
      </Typography>
    </Box>
    
    <Box sx={{ 
      height: 200, 
      background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.1) 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(255,215,0,0.3)'
    }}>
      <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
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
        <PremiumProfileCard elevation={0} sx={{ p: 4, mb: 4, position: 'relative' }}>
          <ProBadge 
            variant="premium" 
            size="large"
            position={{ top: '24px', right: '24px' }}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Box sx={{ position: 'relative' }}>
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
              <VerifiedIcon sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                color: '#FFD700',
                bgcolor: '#000',
                borderRadius: '50%',
                p: 0.5,
                fontSize: 28
              }} />
            </Box>
            
            <Box sx={{ ml: 4, flex: 1 }}>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Typography variant="h3" sx={{ 
                  color: '#fff', 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {user.name}
                </Typography>
                <ProBadge variant="verified" size="medium" />
              </Box>
              
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                🎵 Premium {user.role} • Verified Artist
              </Typography>
              
              <Box display="flex" alignItems="center" gap={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PeopleIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {mockAnalytics.followers} followers
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <AudiotrackIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {mockAnalytics.totalPlays} total plays
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Button 
              variant="contained"
              onClick={() => navigate('/me')}
              sx={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#000',
                fontWeight: 600,
                borderRadius: '12px',
                px: 3
              }}
            >
              <EditIcon sx={{ mr: 1 }} />
              Manage Profile
            </Button>
          </Box>
        </PremiumProfileCard>

        {/* Premium Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <PremiumStatCard 
              title="Monthly Earnings" 
              value={`$${mockAnalytics.monthlyEarnings}`}
              subtitle="This month"
              icon={<AttachMoneyIcon />}
              trend={12.5}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PremiumStatCard 
              title="Total Plays" 
              value={mockAnalytics.totalPlays.toLocaleString()}
              subtitle="All time"
              icon={<AudiotrackIcon />}
              trend={8.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PremiumStatCard 
              title="Bookings" 
              value={mockAnalytics.bookings}
              subtitle="This month"
              icon={<CalendarTodayIcon />}
              trend={15.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PremiumStatCard 
              title="Rating" 
              value={mockAnalytics.rating}
              subtitle="Average"
              icon={<VerifiedIcon />}
              trend={2.1}
            />
          </Grid>
        </Grid>

        {/* Enhanced Analytics Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <RevenueChart />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <AnalyticsCard elevation={0} sx={{ p: 3, mb: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <ProBadge variant="premium" size="small" />
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
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
                  <Box key={index} display="flex" alignItems="center" gap={2}>
                    <VerifiedIcon sx={{ color: '#4caf50', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {item.feature}
                    </Typography>
                  </Box>
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