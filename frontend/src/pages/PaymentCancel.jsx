import React from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const CancelContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #ff7b7b 0%, #d63384 100%)',
}));

const CancelCard = styled(Paper)(({ theme }) => ({
  padding: '60px 40px',
  textAlign: 'center',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  maxWidth: '500px',
  width: '100%',
}));

const CancelIcon = styled(CancelIcon)(({ theme }) => ({
  fontSize: '80px',
  color: '#f44336',
  marginBottom: '20px',
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
      <CancelCard>
        <CancelIcon />
        
        <Typography variant="h3" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
          Payment Cancelled
        </Typography>
        
        <Typography variant="h6" sx={{ mb: 3, color: '#666' }}>
          No worries! Your payment was cancelled and no charges were made.
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
          You can upgrade to Pro anytime to unlock premium features like unlimited events, 
          advanced analytics, and priority support.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={handleReturnToDashboard}
            sx={{
              px: 3,
              py: 1.5,
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Back to Dashboard
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleTryAgain}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 3,
              py: 1.5,
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Try Again
          </Button>
        </Box>
      </CancelCard>
    </CancelContainer>
  );
};

export default PaymentCancel;