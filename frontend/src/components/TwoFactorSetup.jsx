import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { QRCodeSVG } from 'qrcode.react';
import OTPInput from 'react-otp-input';
import {
  Security as SecurityIcon,
  Smartphone as PhoneIcon,
  VerifiedUser as VerifiedIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { authService } from '../services/authService';

// Styled components matching AI theme
const BackgroundContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  position: 'relative',
  overflow: 'hidden',
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
}));

const QRContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
}));

const BackupCodeChip = styled(Chip)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: theme.spacing(0.5),
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
}));

const steps = ['Setup Instructions', 'Scan QR Code', 'Verify Code', 'Save Backup Codes'];

export default function TwoFactorSetup({ open, onClose, onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open && activeStep === 1 && !qrData) {
      setupTwoFactor();
    }
  }, [open, activeStep]);

  const setupTwoFactor = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.setup2FA();
      console.log('2FA Setup Response:', response.data); // Debug log
      console.log('QR Code value:', response.data.qrCode); // Debug log
      setQrData(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authService.enable2FA(verificationCode);
      setBackupCodes(response.data.backupCodes);
      setSuccess('2FA enabled successfully!');
      setActiveStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    });
  };

  const downloadBackupCodes = () => {
    const content = `EventPlanner 2FA Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eventplanner-2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNext = () => {
    if (activeStep === 2) {
      verifyAndEnable();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleComplete = () => {
    onComplete?.();
    handleClose();
  };

  const handleClose = () => {
    setActiveStep(0);
    setQrData(null);
    setVerificationCode('');
    setBackupCodes([]);
    setError('');
    setSuccess('');
    onClose();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 3 }}>
              Enable Two-Factor Authentication
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon sx={{ color: '#4CAF50' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Download Google Authenticator"
                  secondary="Install the Google Authenticator app on your smartphone"
                  sx={{ color: 'white' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon sx={{ color: '#2196F3' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Scan QR Code"
                  secondary="Use the app to scan the QR code we'll show you"
                  sx={{ color: 'white' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <VerifiedIcon sx={{ color: '#FF9800' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Verify Setup"
                  secondary="Enter a 6-digit code from the app to complete setup"
                  sx={{ color: 'white' }}
                />
              </ListItem>
            </List>
          </Box>
        );

      case 1:
        return (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 3 }}>
              Scan QR Code with Google Authenticator
            </Typography>
            {loading ? (
              <CircularProgress sx={{ color: 'white' }} />
            ) : qrData ? (
              <Box>
                <QRContainer sx={{ mb: 3 }}>
                  {qrData.qrCode && qrData.qrCode.startsWith('otpauth://') ? (
                    <QRCodeSVG 
                      value={qrData.qrCode} 
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography sx={{ color: 'red' }}>
                        Invalid QR Code Data
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: 'gray' }}>
                        {qrData.qrCode ? 'Unexpected format' : 'No data received'}
                      </Typography>
                    </Box>
                  )}
                </QRContainer>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                  Can't scan? Enter this code manually:
                </Typography>
                <Box 
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    p: 2, 
                    borderRadius: 2,
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: 'white',
                    wordBreak: 'break-all',
                    cursor: 'pointer'
                  }}
                  onClick={() => copyToClipboard(qrData.manualEntryKey)}
                >
                  {qrData.manualEntryKey}
                  <CopyIcon sx={{ ml: 1, fontSize: 16 }} />
                </Box>
              </Box>
            ) : null}
          </Box>
        );

      case 2:
        return (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 3 }}>
              Enter Verification Code
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
              Enter the 6-digit code from Google Authenticator
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <OTPInput
                value={verificationCode}
                onChange={setVerificationCode}
                numInputs={6}
                renderSeparator={<span style={{ margin: '0 8px', color: 'white' }}>-</span>}
                renderInput={(props) => (
                  <input
                    {...props}
                    style={{
                      width: '50px',
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
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 3 }}>
              Save Your Backup Codes
            </Typography>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Save these backup codes in a safe place. You can use them to access your account if you lose your phone.
                Each code can only be used once.
              </Typography>
            </Alert>
            <Box sx={{ mb: 3 }}>
              {backupCodes.map((code, index) => (
                <BackupCodeChip
                  key={index}
                  label={code}
                  onClick={() => copyToClipboard(code)}
                  icon={<CopyIcon />}
                />
              ))}
            </Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadBackupCodes}
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': { borderColor: 'white' }
              }}
            >
              Download Backup Codes
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: { background: 'transparent', boxShadow: 'none' }
      }}
    >
      <BackgroundContainer>
        <Box sx={{ p: 4, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GlassPaper sx={{ width: '95%', maxWidth: '1200px', margin: '20px auto' }}>
            <DialogContent>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel sx={{ '& .MuiStepLabel-label': { color: 'white' } }}>
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}

              {renderStepContent(activeStep)}
            </DialogContent>

            <DialogActions>
              <Button
                onClick={handleClose}
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Cancel
              </Button>
              
              {activeStep > 0 && activeStep < 3 && (
                <Button
                  onClick={handleBack}
                  sx={{ color: 'white' }}
                >
                  Back
                </Button>
              )}

              {activeStep < 2 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading || (activeStep === 1 && !qrData)}
                  sx={{
                    background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #45a049, #4CAF50)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Next'}
                </Button>
              )}

              {activeStep === 2 && (
                <Button
                  variant="contained"
                  onClick={verifyAndEnable}
                  disabled={loading || verificationCode.length !== 6}
                  sx={{
                    background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #45a049, #4CAF50)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Enable 2FA'}
                </Button>
              )}

              {activeStep === 3 && (
                <Button
                  variant="contained"
                  onClick={handleComplete}
                  sx={{
                    background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #45a049, #4CAF50)',
                    },
                  }}
                >
                  Complete Setup
                </Button>
              )}
            </DialogActions>
          </GlassPaper>
        </Box>
      </BackgroundContainer>
    </Dialog>
  );
}
