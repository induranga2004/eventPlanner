import React, { useState, useEffect } from 'react';
import { Container, LinearProgress, Box, Typography } from '@mui/material';
import { useSubscription } from '../hooks/useSubscription';
import UserDashboard from './UserDashboard';
import ProUserDashboard from './ProUserDashboard';
import StarIcon from '@mui/icons-material/Star';

const DashboardRouter = () => {
  const { subscription, loading } = useSubscription();
  const [isProUser, setIsProUser] = useState(false);

  useEffect(() => {
    if (subscription && !loading) {
      // Check if user has active pro subscription
      // Must be BOTH pro plan AND active status
      const isPro = subscription.plan === 'pro' && subscription.status === 'active';
      
      setIsProUser(isPro);
      console.log('Dashboard Router - Subscription Status:', subscription);
      console.log('Dashboard Router - Plan:', subscription.plan);
      console.log('Dashboard Router - Status:', subscription.status);
      console.log('Dashboard Router - Is Pro User:', isPro);
    }
  }, [subscription, loading]);

  if (loading) {
    return (
      <Container sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <StarIcon sx={{ color: '#FFD700', animation: 'pulse 1.5s infinite' }} />
          <Typography variant="h6" sx={{ color: '#333' }}>
            Loading your dashboard...
          </Typography>
        </Box>
        <LinearProgress sx={{ width: '300px' }} />
      </Container>
    );
  }

  // Route to appropriate dashboard based on subscription status
  return isProUser ? <ProUserDashboard /> : <UserDashboard />;
};

export default DashboardRouter;