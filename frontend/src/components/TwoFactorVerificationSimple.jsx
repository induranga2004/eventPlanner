import React, { useState } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { authService } from '../services/authService';

export default function TwoFactorVerificationSimple({ email, tempToken, onSuccess, onBack }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await authService.verify2FA({
        email,
        token: verificationCode,
        isBackupCode: false
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      onSuccess?.(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2
    }}>
      <Box sx={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: 4,
        maxWidth: 400,
        width: '100%',
        textAlign: 'center'
      }}>
        <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
          Two-Factor Authentication
        </Typography>
        
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4 }}>
          Enter the 6-digit code from Google Authenticator
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="000000"
          maxLength={6}
          style={{
            width: '200px',
            height: '50px',
            fontSize: '18px',
            textAlign: 'center',
            borderRadius: '8px',
            border: '2px solid rgba(255,255,255,0.3)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white',
            outline: 'none',
            marginBottom: '24px'
          }}
        />

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleVerify}
            disabled={loading || verificationCode.length !== 6}
            sx={{
              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049, #4CAF50)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Continue'}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={onBack}
            sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
          >
            ← Back to Login
          </Button>
        </Box>
      </Box>
    </Box>
  );
}