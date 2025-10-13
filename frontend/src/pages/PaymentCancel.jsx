import React from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

// Create Motion components
const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

// Color Hunt styled components for Cancel page
const CancelContainer = styled(Container)(({ theme }) => ({
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
    background: 'radial-gradient(circle at 50% 50%, rgba(91, 153, 194, 0.15) 0%, transparent 50%)',
    pointerEvents: 'none',
  }
}));

const CancelCard = styled(MotionPaper)(({ theme }) => ({
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

const StyledCancelIcon = styled(motion.create(CancelIcon))(({ theme }) => ({
  fontSize: '80px',
  color: '#5B99C2',
  marginBottom: '20px',
  opacity: 0.9,
}));

const PaymentCancel = () => {
  const navigate = useNavigate();

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  const handleTryAgain = () => {
    navigate('/dashboard?upgrade=true');
  };

  return (
    <CancelContainer>
      <CancelCard
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          type: 'spring', 
          stiffness: 200,
          damping: 20
        }}
      >
        {/* Animated Cancel Icon with Shake */}
        <StyledCancelIcon 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: 1, 
            rotate: 0,
          }}
          transition={{ 
            duration: 0.6,
            type: 'spring',
            stiffness: 260,
            damping: 20
          }}
        />
        
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Typography variant="h3" sx={{ mb: 2, color: '#F9DBBA', fontWeight: 'bold' }}>
            Payment Cancelled
          </Typography>
        </MotionBox>
        
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Typography variant="h6" sx={{ mb: 3, color: 'rgba(249, 219, 186, 0.9)' }}>
            No worries! Your payment was cancelled and no charges were made.
          </Typography>
        </MotionBox>
        
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Typography variant="body1" sx={{ mb: 4, color: 'rgba(249, 219, 186, 0.8)' }}>
            You can upgrade to Pro anytime to unlock premium features like unlimited events, 
            advanced analytics, and priority support.
          </Typography>
        </MotionBox>
        
        <MotionBox 
          sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <MotionBox
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outlined" 
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={handleReturnToDashboard}
              sx={{
                px: 3,
                py: 1.5,
                fontSize: '16px',
                fontWeight: 'bold',
                border: '2px solid rgba(91, 153, 194, 0.5)',
                color: '#F9DBBA',
                '&:hover': {
                  border: '2px solid #5B99C2',
                  background: 'rgba(91, 153, 194, 0.1)',
                }
              }}
            >
              Back to Dashboard
            </Button>
          </MotionBox>
          
          <MotionBox
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="contained" 
              size="large"
              onClick={handleTryAgain}
              sx={{
                background: 'linear-gradient(135deg, #5B99C2 0%, #1A4870 100%)',
                color: '#F9DBBA',
                px: 3,
                py: 1.5,
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(91, 153, 194, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1A4870 0%, #5B99C2 100%)',
                  boxShadow: '0 6px 20px rgba(91, 153, 194, 0.6)',
                }
              }}
            >
              Try Again
            </Button>
          </MotionBox>
        </MotionBox>
      </CancelCard>
    </CancelContainer>
  );
};

export default PaymentCancel;