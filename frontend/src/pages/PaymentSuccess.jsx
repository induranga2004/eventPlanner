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
import { styled, keyframes } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

// Success animation
const successGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 30px rgba(76, 175, 80, 0.4); 
  }
  50% { 
    box-shadow: 0 0 60px rgba(76, 175, 80, 0.6); 
  }
`;

const SuccessContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}));

const SuccessCard = styled(Paper)(({ theme }) => ({
  padding: '60px 40px',
  textAlign: 'center',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  maxWidth: '500px',
  width: '100%',
  animation: `${successGlow} 3s ease-in-out infinite`,
}));

const SuccessIcon = styled(CheckCircleIcon)(({ theme }) => ({
  fontSize: '80px',
  color: '#4caf50',
  marginBottom: '20px',
}));

const ProBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1,
  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  color: '#000',
  padding: '8px 16px',
  borderRadius: '20px',
  fontWeight: 'bold',
  fontSize: '14px',
  marginBottom: '20px',
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
          const upgradeResponse = await fetch('http://localhost:4000/api/subscription/manual-upgrade', {
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
      const response = await fetch('http://localhost:4000/api/subscription/manual-upgrade', {
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
        <SuccessCard>
          <CircularProgress size={60} sx={{ color: '#4caf50', mb: 3 }} />
          <Typography variant="h5" sx={{ mb: 2, color: '#333' }}>
            Payment Successful! 🎉
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
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
        <SuccessCard>
          <CircularProgress size={60} sx={{ color: '#FFD700', mb: 3 }} />
          <Typography variant="h5" sx={{ mb: 2, color: '#333' }}>
            Activating Pro Features...
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
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
        <SuccessCard>
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleContinue}
            sx={{ mr: 2 }}
          >
            Continue to Dashboard
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            size="large"
            onClick={handleManualUpgrade}
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
        <SuccessCard>
          <SuccessIcon />
          
          <Fade in={true} timeout={1200}>
            <ProBadge>
              <StarIcon />
              PRO ACTIVATED
            </ProBadge>
          </Fade>

          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
            Welcome to Pro! 🎉
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 3, color: '#4caf50' }}>
            Your payment was successful and your account has been upgraded.
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
              You now have access to:
            </Typography>
            <Box component="ul" sx={{ textAlign: 'left', color: '#666', pl: 3 }}>
              <li>✨ Unlimited Events</li>
              <li>📊 Advanced Analytics</li>
              <li>🚀 Priority Support</li>
              <li>✅ Verified Badge</li>
              <li>🎨 Custom Branding</li>
              <li>🔗 API Access</li>
            </Box>
          </Box>
          
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleContinue}
            sx={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#000',
              px: 4,
              py: 1.5,
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #FFE55C 0%, #FFB347 100%)',
              }
            }}
          >
            Go to Pro Dashboard →
          </Button>
        </SuccessCard>
      </Fade>
    </SuccessContainer>
  );
};

export default PaymentSuccess;