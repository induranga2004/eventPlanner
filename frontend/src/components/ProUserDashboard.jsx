import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Avatar,
  Chip,
  Button,
  LinearProgress,
  Fade
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import ProBadge from './ProBadge';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

// Pro-specific icons
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import VerifiedIcon from '@mui/icons-material/Verified';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BrushIcon from '@mui/icons-material/Brush';
import ApiIcon from '@mui/icons-material/Api';
import EventIcon from '@mui/icons-material/Event';
import InsightsIcon from '@mui/icons-material/Insights';
import SecurityIcon from '@mui/icons-material/Security';

// Premium animations
const premiumGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.2); 
  }
  50% { 
    box-shadow: 0 0 50px rgba(255, 215, 0, 0.6), 0 0 100px rgba(255, 215, 0, 0.3); 
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

// Pro-themed styled components
const ProDashboardCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
  backdropFilter: 'blur(20px)',
  border: '2px solid rgba(255, 215, 0, 0.3)',
  borderRadius: '20px',
  color: '#fff',
  overflow: 'hidden',
  position: 'relative',
  animation: `${premiumGlow} 3s ease-in-out infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 165, 0, 0.05) 100%)',
    zIndex: -1,
  },
}));

const ProFeatureCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 215, 0, 0.2)',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 30px rgba(255, 215, 0, 0.3)',
  },
}));

const AnalyticsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(102, 126, 234, 0.2)',
  borderRadius: '16px',
  height: '200px',
}));

const ProUserDashboard = () => {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { subscription } = useSubscription();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await me();
        setUser(userData.user);
        setMounted(true);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  if (!user) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LinearProgress sx={{ width: '300px' }} />
      </Container>
    );
  }

  const proFeatures = [
    { 
      icon: <EventIcon />, 
      title: 'Unlimited Events', 
      description: 'Create unlimited events without restrictions',
      active: true
    },
    { 
      icon: <AnalyticsIcon />, 
      title: 'Advanced Analytics', 
      description: 'Detailed insights and performance metrics',
      active: true
    },
    { 
      icon: <SupportAgentIcon />, 
      title: 'Priority Support', 
      description: '24/7 premium customer support',
      active: true
    },
    { 
      icon: <VerifiedIcon />, 
      title: 'Verified Badge', 
      description: 'Official verification status',
      active: true
    },
    { 
      icon: <BrushIcon />, 
      title: 'Custom Branding', 
      description: 'Personalize your event pages',
      active: true
    },
    { 
      icon: <ApiIcon />, 
      title: 'API Access', 
      description: 'Full API integration capabilities',
      active: true
    },
  ];

  return (
    <DashboardLayout title="Pro Dashboard" navItems={[{ label: 'Profile', to: '/me' }]} role="user">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        
        {/* Pro Welcome Card */}
        <ProDashboardCard elevation={0} sx={{ p: 4, mb: 4, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#000',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              >
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                    Welcome back, {user.name}!
                  </Typography>
                  <ProBadge variant="pro" />
                </Box>
                <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                  Pro Member • {user.email}
                </Typography>
                <Chip 
                  icon={<VerifiedIcon />}
                  label="Verified Pro Account"
                  sx={{ 
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: '#000',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                onClick={() => navigate('/me')}
              >
                Manage Account
              </Button>
            </Box>
          </Box>
        </ProDashboardCard>

        <Fade in={mounted} timeout={600}>
          <Box>
            {/* Pro Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard 
                  title="Pro Status" 
                  value="Active" 
                  subtitle="Premium Member" 
                  color="warning"
                  icon={<StarIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard 
                  title="Events Created" 
                  value="∞" 
                  subtitle="Unlimited" 
                  color="success"
                  icon={<EventIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard 
                  title="Analytics" 
                  value="Advanced" 
                  subtitle="Real-time insights" 
                  color="info"
                  icon={<TrendingUpIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard 
                  title="Support" 
                  value="Priority" 
                  subtitle="24/7 Premium" 
                  color="primary"
                  icon={<SupportAgentIcon />}
                />
              </Grid>
            </Grid>

            {/* Pro Features Grid */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
              Your Pro Features
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {proFeatures.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <ProFeatureCard>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ 
                          p: 1, 
                          borderRadius: '50%', 
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          color: '#000',
                          mr: 2
                        }}>
                          {feature.icon}
                        </Box>
                        <Chip 
                          label="ACTIVE" 
                          size="small"
                          sx={{ 
                            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </ProFeatureCard>
                </Grid>
              ))}
            </Grid>

            {/* Analytics Section */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
              Advanced Analytics
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <AnalyticsCard>
                  <CardContent sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <InsightsIcon sx={{ mr: 1, color: '#667eea' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                        Event Performance
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                      Real-time analytics for all your events
                    </Typography>
                    <Box sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '8px',
                      p: 2,
                      color: 'white',
                      textAlign: 'center'
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Coming Soon
                      </Typography>
                      <Typography variant="body2">
                        Advanced analytics dashboard
                      </Typography>
                    </Box>
                  </CardContent>
                </AnalyticsCard>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <AnalyticsCard>
                  <CardContent sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SecurityIcon sx={{ mr: 1, color: '#667eea' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                        Premium Security
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                      Enhanced security features for Pro users
                    </Typography>
                    <Box sx={{ 
                      background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                      borderRadius: '8px',
                      p: 2,
                      color: 'white',
                      textAlign: 'center'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        ✓ Active
                      </Typography>
                      <Typography variant="body2">
                        All security features enabled
                      </Typography>
                    </Box>
                  </CardContent>
                </AnalyticsCard>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>
    </DashboardLayout>
  );
};

export default ProUserDashboard;