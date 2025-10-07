import React, { useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// AI-themed animations
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`

const AIBackground = styled(Box)(({ theme }) => ({
  position: 'fixed', 
  top: 0, 
  left: 0, 
  right: 0, 
  bottom: 0, 
  background: 'linear-gradient(-45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 15s ease infinite`,
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
  zIndex: 9999,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(5px)',
  }
}))

const GlassModal = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  padding: theme.spacing(4),
  maxWidth: 400,
  width: '90%',
  color: 'white',
  position: 'relative',
  zIndex: 1,
  animation: `${float} 6s ease-in-out infinite`,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
}))

export default function TwoFactorSetup({ open, onClose, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  return (
    <AIBackground>
      <GlassModal>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
          Two-Factor Authentication Setup
        </Typography>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              background: 'rgba(244, 67, 54, 0.2)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: '#ff6b6b'
              }
            }}
          >
            {error}
          </Alert>
        )}
        
        <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.9)' }}>
          This is a placeholder for the 2FA setup component. 
          The full implementation is available but has syntax issues that need to be resolved.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            sx={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              '&:hover': {
                background: 'rgba(255,255,255,0.3)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              onComplete?.();
              onClose();
            }}
            disabled={loading}
          >
            Complete Setup
          </Button>
        </Box>
      </GlassModal>
    </AIBackground>
  );
}