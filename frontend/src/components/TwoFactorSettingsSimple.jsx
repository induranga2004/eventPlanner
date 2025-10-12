import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Security as SecurityIcon } from '@mui/icons-material';
import { authService } from '../services/authService';
import TwoFactorSetupSimple from './TwoFactorSetupSimple';

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

export default function TwoFactorSettingsSimple() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await authService.get2FAStatus();
      setStatus(response.data);
    } catch (err) {
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
            <Typography 
              variant="body2" 
              sx={{ 
                color: status?.twoFactorEnabled ? '#4CAF50' : '#FF9800',
                fontWeight: 'bold'
              }}
            >
              {status?.twoFactorEnabled ? '✓ Enabled' : '⚠ Disabled'}
            </Typography>
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
                    // For simplicity, just show an alert
                    alert('To disable 2FA, please contact support or use the full settings interface.');
                  }
                }}
                color="primary"
              />
            }
            label=""
          />
        </Box>

        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Two-factor authentication adds an extra layer of security to your account.
          When enabled, you'll need to enter a code from Google Authenticator when signing in.
        </Typography>

        {status?.twoFactorEnabled && (
          <Box mt={2}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Backup codes remaining: {status.backupCodesCount || 0}
            </Typography>
          </Box>
        )}
      </GlassPaper>

      {/* Setup Dialog */}
      <TwoFactorSetupSimple
        open={showSetup}
        onClose={() => setShowSetup(false)}
        onComplete={handleSetupComplete}
      />
    </Box>
  );
}