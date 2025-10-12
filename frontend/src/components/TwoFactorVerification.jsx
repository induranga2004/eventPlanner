import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Link,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/system';
import OTPInput from 'react-otp-input';
import {
  Security as SecurityIcon,
  Smartphone as PhoneIcon,
  VpnKey as KeyIcon
} from '@mui/icons-material';
import { authService } from '../services/authService';

// Styled components matching AI theme
const BackgroundContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
    `,
    animation: 'gradientShift 15s ease-in-out infinite',
  },
  '@keyframes gradientShift': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.8 },
  },
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  padding: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  zIndex: 1,
  width: '95%',
  maxWidth: 800,
  margin: '20px auto',
}));

const FloatingIcon = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4CAF50, #45a049)',
  borderRadius: '50%',
  width: 60,
  height: 60,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 24px auto',
  animation: 'float 3s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
  },
}));

export default function TwoFactorVerification({ email, tempToken, onSuccess, onBack }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBackupCode, setShowBackupCode] = useState(false);

  const handleVerify = async () => {
    if (verificationCode.length !== 6 && verificationCode.length !== 8) {
      setError('Please enter a valid verification code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await authService.verify2FA({
        email,
        token: verificationCode,
        isBackupCode: showBackupCode
      });

      // Store the token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      onSuccess?.(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && verificationCode.length >= 6) {
      handleVerify();
    }
  };

  return (
    <BackgroundContainer>
      <GlassPaper>
        <FloatingIcon>
          <SecurityIcon sx={{ color: 'white', fontSize: 30 }} />
        </FloatingIcon>

        <Typography
          variant="h4"
          align="center"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            mb: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Two-Factor Authentication
        </Typography>

        <Typography
          variant="body1"
          align="center"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            mb: 4,
          }}
        >
          {showBackupCode
            ? 'Enter one of your backup codes'
            : 'Enter the 6-digit code from Google Authenticator'
          }
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            {showBackupCode ? (
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Backup Code"
                style={{
                  width: '200px',
                  height: '50px',
                  fontSize: '16px',
                  textAlign: 'center',
                  borderRadius: '8px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
            ) : (
              <OTPInput
                value={verificationCode}
                onChange={setVerificationCode}
                numInputs={6}
                renderSeparator={<span style={{ margin: '0 8px', color: 'white' }}>-</span>}
                renderInput={(props) => (
                  <input
                    {...props}
                    style={{
                      width: '45px',
                      height: '50px',
                      margin: '0 4px',
                      fontSize: '18px',
                      borderRadius: '8px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      textAlign: 'center',
                      outline: 'none',
                      ...props.style
                    }}
                  />
                )}
              />
            )}
          </Box>

          <Box textAlign="center">
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                setShowBackupCode(!showBackupCode);
                setVerificationCode('');
                setError('');
              }}
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                '&:hover': {
                  color: 'white',
                  textDecoration: 'underline',
                },
              }}
            >
              {showBackupCode
                ? '← Use Google Authenticator code instead'
                : 'Use backup code instead'
              }
            </Link>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleVerify}
          disabled={loading || verificationCode.length < 6}
          sx={{
            mb: 2,
            py: 1.5,
            background: 'linear-gradient(45deg, #4CAF50, #45a049)',
            '&:hover': {
              background: 'linear-gradient(45deg, #45a049, #4CAF50)',
            },
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Verify & Continue'
          )}
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={onBack}
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          ← Back to Login
        </Button>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box textAlign="center">
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Having trouble? Make sure your device's time is synchronized and try again.
          </Typography>
        </Box>
      </GlassPaper>
    </BackgroundContainer>
  );
}
