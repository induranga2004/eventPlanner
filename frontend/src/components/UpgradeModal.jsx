import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VerifiedIcon from '@mui/icons-material/Verified';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BrushIcon from '@mui/icons-material/Brush';
import ApiIcon from '@mui/icons-material/Api';
import { useSubscription } from '../hooks/useSubscription';

// Premium glow animation
const premiumGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.2); 
  }
  50% { 
    box-shadow: 0 0 50px rgba(255, 215, 0, 0.6), 0 0 100px rgba(255, 215, 0, 0.3); 
  }
`;

// Styled components
const PremiumDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95) 0%, rgba(30, 30, 50, 0.95) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    maxWidth: '800px',
    width: '90vw'
  }
}));

const PlanCard = styled(Card)(({ isPro, popular }) => ({
  background: isPro 
    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.15) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
  backdropFilter: 'blur(20px)',
  border: isPro 
    ? '2px solid rgba(255, 215, 0, 0.5)'
    : '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  position: 'relative',
  animation: isPro ? `${premiumGlow} 3s ease-in-out infinite` : 'none',
  transform: popular ? 'scale(1.05)' : 'scale(1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: popular ? 'scale(1.07)' : 'scale(1.02)',
  }
}));

const PopularBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: '-10px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  color: '#000',
  fontWeight: 'bold',
  fontSize: '12px',
  zIndex: 1
}));

const FeatureIcon = ({ feature }) => {
  const icons = {
    'Unlimited Events': <TrendingUpIcon sx={{ color: '#4caf50' }} />,
    'Advanced Analytics': <AnalyticsIcon sx={{ color: '#2196f3' }} />,
    'Priority Support': <SupportAgentIcon sx={{ color: '#ff9800' }} />,
    'Verified Badge': <VerifiedIcon sx={{ color: '#FFD700' }} />,
    'Custom Branding': <BrushIcon sx={{ color: '#e91e63' }} />,
    'API Access': <ApiIcon sx={{ color: '#9c27b0' }} />
  };
  
  return icons[feature] || <CheckCircleIcon sx={{ color: '#4caf50' }} />;
};

const UpgradeModal = ({ open, onClose, feature }) => {
  const [loading, setLoading] = useState(false);
  const { upgradeToPro } = useSubscription();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await upgradeToPro();
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      features: [
        '5 Events per month',
        '2 Photos upload',
        'Basic profile',
        'Standard support',
        'Community access'
      ],
      limitations: true,
      buttonText: 'Current Plan',
      disabled: true
    },
    {
      name: 'Pro',
      price: 29,
      period: 'month',
      features: [
        'Unlimited Events',
        '20+ Photos upload',
        'Advanced Analytics',
        'Priority Support',
        'Verified Badge',
        'Custom Branding',
        'API Access',
        'Premium templates',
        'Export data',
        'Early access to features'
      ],
      popular: true,
      buttonText: 'Upgrade to Pro',
      isPro: true
    }
  ];

  return (
    <PremiumDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <StarIcon sx={{ color: '#FFD700', fontSize: 32 }} />
            <Typography variant="h4" sx={{ 
              color: '#fff', 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Upgrade to Pro
            </Typography>
          </Box>
          <Button 
            onClick={onClose}
            sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 'auto', p: 1 }}
          >
            <CloseIcon />
          </Button>
        </Box>
        {feature && (
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
            Unlock "{feature}" and many more premium features
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {plans.map((plan) => (
            <Grid item xs={12} md={6} key={plan.name}>
              <PlanCard isPro={plan.isPro} popular={plan.popular}>
                {plan.popular && (
                  <PopularBadge 
                    label="MOST POPULAR"
                    icon={<StarIcon sx={{ fontSize: 16 }} />}
                  />
                )}
                
                <CardContent sx={{ p: 3 }}>
                  <Box textAlign="center" mb={3}>
                    <Typography variant="h5" sx={{ 
                      color: plan.isPro ? '#FFD700' : '#fff', 
                      fontWeight: 700,
                      mb: 1
                    }}>
                      {plan.name}
                    </Typography>
                    
                    <Box display="flex" alignItems="baseline" justifyContent="center" gap={1}>
                      <Typography variant="h3" sx={{ 
                        color: plan.isPro ? '#FFD700' : '#fff',
                        fontWeight: 700
                      }}>
                        ${plan.price}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        /{plan.period}
                      </Typography>
                    </Box>
                  </Box>

                  <List dense sx={{ mb: 3 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <FeatureIcon feature={feature} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          primaryTypographyProps={{
                            sx: { 
                              color: 'rgba(255,255,255,0.9)',
                              fontSize: '14px'
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    fullWidth
                    variant={plan.isPro ? "contained" : "outlined"}
                    disabled={plan.disabled || loading}
                    onClick={plan.isPro ? handleUpgrade : undefined}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      borderRadius: '12px',
                      ...(plan.isPro && {
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        color: '#000',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
                        }
                      }),
                      ...(!plan.isPro && {
                        borderColor: 'rgba(255,255,255,0.3)',
                        color: 'rgba(255,255,255,0.7)'
                      })
                    }}
                  >
                    {loading ? 'Processing...' : plan.buttonText}
                  </Button>
                </CardContent>
              </PlanCard>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, p: 3, background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
            💳 Secure payment powered by Stripe • 🔒 Cancel anytime • ⚡ Instant activation
          </Typography>
        </Box>
      </DialogContent>
    </PremiumDialog>
  );
};

export default UpgradeModal;