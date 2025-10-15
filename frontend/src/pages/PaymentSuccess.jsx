import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { buildNodeApiUrl } from '../config/api.js';

// Create Motion components
const MotionBox = motion.create(Box);
const MotionPaper = motion.create(Paper);

// Color Hunt styled components for Success page
const SuccessContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1F316F 0%, #1A4870 50%, #1F316F 100%)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(91, 153, 194, 0.2) 0%, transparent 50%)',
    pointerEvents: 'none',
  }
}));

const SuccessCard = styled(MotionPaper)(({ theme }) => ({
  padding: '60px 40px',
  textAlign: 'center',
  background: 'linear-gradient(135deg, rgba(26, 72, 112, 0.95) 0%, rgba(31, 49, 111, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '2px solid rgba(91, 153, 194, 0.4)',
  maxWidth: '500px',
  width: '100%',
  position: 'relative',
  zIndex: 1,
}));

const SuccessIcon = styled(motion.create(CheckCircleIcon))(({ theme }) => ({
  fontSize: '80px',
  color: '#5B99C2',
  marginBottom: '20px',
}));

const ProBadge = styled(MotionBox)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1,
  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  color: '#1F316F',
  padding: '8px 16px',
  borderRadius: '20px',
  fontWeight: 'bold',
  fontSize: '14px',
  marginBottom: '20px',
  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
}));

const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upgradePhase, setUpgradePhase] = useState('processing');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchSubscriptionStatus } = useSubscription();

  useEffect(() => {
    const refreshSubscription = async () => {
      try {
        setLoading(true);
        setUpgradePhase('processing');
        
        const token = localStorage.getItem('token');
        console.log('🔄 Processing payment success...');
        
        // Show processing state
        await new Promise(resolve => setTimeout(resolve, 1500));
        setUpgradePhase('upgrading');
        
        // Manual upgrade for local development
        try {
          const upgradeResponse = await fetch(buildNodeApiUrl('/subscription/manual-upgrade'), {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (upgradeResponse.ok) {
            const upgradeData = await upgradeResponse.json();
            console.log('✅ Manual upgrade successful:', upgradeData);
          } else {
            console.log('⚠️ Manual upgrade failed, user may already be Pro');
          }
        } catch (upgradeError) {
          console.error('Manual upgrade error:', upgradeError);
        }
        
        await fetchSubscriptionStatus();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUpgradePhase('completed');
        setLoading(false);
        
      } catch (error) {
        console.error('Error refreshing subscription:', error);
        setError('Failed to update subscription status');
        setUpgradePhase('error');
        setLoading(false);
      }
    };

    refreshSubscription();
  }, [fetchSubscriptionStatus]);

  const handleContinue = () => {
    navigate('/user-dashboard');
  };

  const handleManualUpgrade = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(buildNodeApiUrl('/subscription/manual-upgrade'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Manual upgrade response:', data);
        await fetchSubscriptionStatus();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upgrade subscription manually');
      }
    } catch (error) {
      console.error('Manual upgrade error:', error);
      setError('Failed to upgrade subscription manually');
    } finally {
      setLoading(false);
    }
  };

  // Phase 1: Processing payment
  if (loading && upgradePhase === 'processing') {
    return (
      <SuccessContainer>
        <SuccessCard
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        >
          <MotionBox
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <CircularProgress size={60} sx={{ color: '#5B99C2', mb: 3 }} />
          </MotionBox>
          <Typography variant="h5" sx={{ mb: 2, color: '#F9DBBA', fontWeight: 600 }}>
            Payment Successful! 🎉
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(249, 219, 186, 0.8)' }}>
            Processing your upgrade...
          </Typography>
        </SuccessCard>
      </SuccessContainer>
    );
  }

  // Phase 2: Upgrading to Pro
  if (loading && upgradePhase === 'upgrading') {
    return (
      <SuccessContainer>
        <SuccessCard
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        >
          <MotionBox
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <CircularProgress size={60} sx={{ color: '#FFD700', mb: 3 }} />
          </MotionBox>
          <Typography variant="h5" sx={{ mb: 2, color: '#F9DBBA', fontWeight: 600 }}>
            Activating Pro Features...
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(249, 219, 186, 0.8)' }}>
            Setting up your premium account...
          </Typography>
        </SuccessCard>
      </SuccessContainer>
    );
  }

  // Error state
  if (error || upgradePhase === 'error') {
    return (
      <SuccessContainer>
        <SuccessCard
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              background: 'rgba(91, 153, 194, 0.2)',
              color: '#F9DBBA',
              border: '1px solid rgba(91, 153, 194, 0.4)',
            }}
          >
            {error}
          </Alert>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleContinue}
            sx={{ 
              mr: 2,
              background: 'linear-gradient(135deg, #5B99C2 0%, #1A4870 100%)',
              color: '#F9DBBA',
            }}
          >
            Continue to Dashboard
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            onClick={handleManualUpgrade}
            sx={{
              border: '1px solid rgba(91, 153, 194, 0.5)',
              color: '#F9DBBA',
            }}
          >
            Try Manual Upgrade
          </Button>
        </SuccessCard>
      </SuccessContainer>
    );
  }

  // Phase 3: Success - Pro activated
  return (
    <SuccessContainer>
      <Fade in={true} timeout={800}>
        <SuccessCard
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            type: 'spring', 
            stiffness: 200,
            damping: 15
          }}
        >
          {/* Animated Success Icon with Spring Bounce */}
          <SuccessIcon 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.3,
              duration: 0.6,
              type: 'spring',
              stiffness: 260,
              damping: 20
            }}
          />
          
          {/* Pro Badge with Slide-in */}
          <Fade in={true} timeout={1200}>
            <ProBadge
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              <StarIcon />
              PRO ACTIVATED
            </ProBadge>
          </Fade>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#F9DBBA' }}>
              Welcome to Pro! 🎉
            </Typography>
          </MotionBox>
          
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Typography variant="h6" sx={{ mb: 3, color: '#5B99C2', fontWeight: 600 }}>
              Your payment was successful and your account has been upgraded.
            </Typography>
          </MotionBox>

          <MotionBox 
            sx={{ mb: 4 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#F9DBBA', fontWeight: 600 }}>
              You now have access to:
            </Typography>
            <Box 
              component="ul" 
              sx={{ 
                textAlign: 'left', 
                color: 'rgba(249, 219, 186, 0.9)', 
                pl: 3,
                '& li': {
                  marginBottom: '8px',
                  fontSize: '16px',
                }
              }}
            >
              {['✨ Unlimited Events', '📊 Advanced Analytics', '🚀 Priority Support', '✅ Verified Badge', '🎨 Custom Branding', '🔗 API Access'].map((feature, index) => (
                <MotionBox
                  component="li"
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                >
                  {feature}
                </MotionBox>
              ))}
            </Box>
          </MotionBox>
          
          <MotionBox
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="contained" 
              size="large"
              onClick={handleContinue}
              sx={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#1F316F',
                px: 4,
                py: 1.5,
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FFE55C 0%, #FFB347 100%)',
                  boxShadow: '0 6px 20px rgba(255, 215, 0, 0.6)',
                }
              }}
            >
              Go to Pro Dashboard →
            </Button>
          </MotionBox>
        </SuccessCard>
      </Fade>
    </SuccessContainer>
  );
};

export default PaymentSuccess;