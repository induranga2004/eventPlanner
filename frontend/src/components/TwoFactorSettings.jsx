import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import OTPInput from 'react-otp-input';
import {
  Security as SecurityIcon,
  Smartphone as PhoneIcon,
  VpnKey as KeyIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { authService } from '../services/authService';
import TwoFactorSetup from './TwoFactorSetup';

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const StatusChip = styled(Chip)(({ enabled }) => ({
  backgroundColor: enabled ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
  color: enabled ? '#4CAF50' : '#FF9800',
  border: `1px solid ${enabled ? '#4CAF50' : '#FF9800'}`,
  fontWeight: 'bold',
}));

export default function TwoFactorSettings() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialogs
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  
  // Disable 2FA form
  const [disableCode, setDisableCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  
  // Backup codes
  const [newBackupCodes, setNewBackupCodes] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      console.log('=== TwoFactorSettings: Fetching 2FA status ===');
      console.log('Token exists:', !!localStorage.getItem('token'));
      
      const response = await authService.get2FAStatus();
      console.log('2FA Status Response:', response);
      console.log('2FA Status Data:', response.data);
      
      setStatus(response.data);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('2FA Status Error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError('Failed to fetch 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    setSuccess('2FA has been enabled successfully!');
    fetchStatus();
  };

  const handleDisable2FA = async () => {
    if (!disableCode || !disablePassword) {
      setError('Please fill in all fields');
      return;
    }

    setDisableLoading(true);
    try {
      await authService.disable2FA({
        token: disableCode,
        password: disablePassword
      });
      
      setShowDisable(false);
      setDisableCode('');
      setDisablePassword('');
      setSuccess('2FA has been disabled');
      fetchStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setDisableLoading(false);
    }
  };

  const generateNewBackupCodes = async () => {
    setBackupLoading(true);
    try {
      const response = await authService.generateNewBackupCodes(disableCode);
      setNewBackupCodes(response.data.backupCodes);
      setShowBackupCodes(true);
      setSuccess('New backup codes generated');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate backup codes');
    } finally {
      setBackupLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = `EventPlanner 2FA Backup Codes\\nGenerated: ${new Date().toLocaleString()}\\n\\n${newBackupCodes.join('\\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eventplanner-2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <GlassPaper>
        <Box display="flex" alignItems="center" justifyContent="center" py={4}>
          <CircularProgress sx={{ color: 'white' }} />
        </Box>
      </GlassPaper>
    );
  }

  return (
    <Box>
      <GlassPaper>
        <Box display="flex" alignItems="center" mb={3}>
          <SecurityIcon sx={{ color: 'white', mr: 2, fontSize: 28 }} />
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
            Two-Factor Authentication
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box>
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
              Security Status
            </Typography>
            <StatusChip
              label={status?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              enabled={status?.twoFactorEnabled}
              icon={status?.twoFactorEnabled ? <SecurityIcon /> : <WarningIcon />}
            />
            {status?.setupDate && (
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mt: 1 }}>
                Enabled on {new Date(status.setupDate).toLocaleDateString()}
              </Typography>
            )}
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={status?.twoFactorEnabled || false}
                onChange={(e) => {
                  if (e.target.checked) {
                    setShowSetup(true);
                  } else {
                    setShowDisable(true);
                  }
                }}
                color="primary"
              />
            }
            label=""
          />
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 3 }} />

        <List>
          <ListItem>
            <ListItemIcon>
              <PhoneIcon sx={{ color: '#4CAF50' }} />
            </ListItemIcon>
            <ListItemText
              primary="Google Authenticator"
              secondary="Use the Google Authenticator app to generate verification codes"
              sx={{ color: 'white' }}
            />
          </ListItem>
          
          {status?.twoFactorEnabled && (
            <ListItem>
              <ListItemIcon>
                <KeyIcon sx={{ color: '#2196F3' }} />
              </ListItemIcon>
              <ListItemText
                primary={`Backup Codes: ${status.backupCodesCount || 0} remaining`}
                secondary="Use backup codes if you lose access to your authenticator app"
                sx={{ color: 'white' }}
              />
            </ListItem>
          )}
        </List>

        {status?.twoFactorEnabled && (
          <Box mt={3} display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => setShowBackupCodes(true)}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': { borderColor: 'white' }
              }}
            >
              Generate New Backup Codes
            </Button>
          </Box>
        )}
      </GlassPaper>

      {/* Setup Dialog */}
      <TwoFactorSetup
        open={showSetup}
        onClose={() => setShowSetup(false)}
        onComplete={handleSetupComplete}
      />

      {/* Disable 2FA Dialog */}
      <Dialog
        open={showDisable}
        onClose={() => setShowDisable(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon sx={{ color: '#FF9800', mr: 1 }} />
            Disable Two-Factor Authentication
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Disabling 2FA will make your account less secure. You'll need to verify your identity.
          </Alert>

          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter a 6-digit code from Google Authenticator:
          </Typography>
          <Box display="flex" justifyContent="center" mb={3}>
            <OTPInput
              value={disableCode}
              onChange={setDisableCode}
              numInputs={6}
              renderSeparator={<span style={{ margin: '0 4px' }}>-</span>}
              renderInput={(props) => (
                <input
                  {...props}
                  style={{
                    width: '40px',
                    height: '40px',
                    margin: '0 2px',
                    fontSize: '16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    textAlign: 'center',
                    ...props.style
                  }}
                />
              )}
            />
          </Box>

          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDisable(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDisable2FA}
            disabled={disableLoading || !disableCode || !disablePassword}
          >
            {disableLoading ? <CircularProgress size={20} /> : 'Disable 2FA'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog
        open={showBackupCodes}
        onClose={() => setShowBackupCodes(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate New Backup Codes</DialogTitle>
        <DialogContent>
          {newBackupCodes.length === 0 ? (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                This will generate new backup codes and invalidate your old ones.
              </Alert>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Enter a 6-digit code from Google Authenticator to continue:
              </Typography>
              <Box display="flex" justifyContent="center" mb={3}>
                <OTPInput
                  value={disableCode}
                  onChange={setDisableCode}
                  numInputs={6}
                  renderSeparator={<span style={{ margin: '0 4px' }}>-</span>}
                  renderInput={(props) => (
                    <input
                      {...props}
                      style={{
                        width: '40px',
                        height: '40px',
                        margin: '0 2px',
                        fontSize: '16px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        textAlign: 'center',
                        ...props.style
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
          ) : (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                New backup codes generated! Save these in a safe place.
              </Alert>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {newBackupCodes.map((code, index) => (
                  <Chip
                    key={index}
                    label={code}
                    sx={{ fontFamily: 'monospace', fontSize: '12px' }}
                  />
                ))}
              </Box>
              <Button
                startIcon={<DownloadIcon />}
                onClick={downloadBackupCodes}
                variant="outlined"
              >
                Download Codes
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowBackupCodes(false);
            setNewBackupCodes([]);
            setDisableCode('');
          }}>
            Close
          </Button>
          {newBackupCodes.length === 0 && (
            <Button
              variant="contained"
              onClick={generateNewBackupCodes}
              disabled={backupLoading || disableCode.length !== 6}
            >
              {backupLoading ? <CircularProgress size={20} /> : 'Generate'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
