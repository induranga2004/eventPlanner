import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'motion/react';
import AuthLayout from '../components/layout/AuthLayout';
import { authService } from '../services/authService';
import { formContainerVariants, formFieldVariants } from '../utils/motionVariants';

const MotionButton = motion.create(Button);

export default function ForgotPassword() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email')?.toString().trim();

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
  await authService.requestPasswordReset(email);
      setSuccess('If an account exists for that email, we just sent a reset link. Check your inbox and spam folder.');
      event.currentTarget.reset();
    } catch (e) {
      const message = e?.response?.data?.error || 'Unable to send reset link right now. Please try again later.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your access"
      subtitle="We’ll send a secure link so you can set a new password."
      description="Enter the email you use for Event Planner Studio and we’ll take care of the rest."
      sideContent={
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <MarkEmailReadRoundedIcon sx={{ fontSize: 32, color: 'secondary.light' }} />
            <Typography variant="body1" color="text.secondary">
              Reset links expire in 24 hours. For security, we’ll only confirm success in your inbox.
            </Typography>
          </Stack>
          <Box
            sx={{
              borderRadius: 2,
              border: '1px solid rgba(148, 163, 184, 0.18)',
              p: 2,
              color: 'text.secondary',
              lineHeight: 1.6,
            }}
          >
            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
              Need a hand?
            </Typography>
            <Typography variant="body2">
              If you don’t see the email, refresh your inbox or request another link after a few minutes.
            </Typography>
          </Box>
        </Stack>
      }
      footer={
        <Button
          component={RouterLink}
          to="/login"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ color: 'text.secondary' }}
        >
          Back to sign in
        </Button>
      }
    >
      <motion.div variants={formContainerVariants} initial="hidden" animate="visible">
        <Stack component="form" spacing={3} onSubmit={handleSubmit}>
          <motion.div variants={formFieldVariants}>
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={700} lineHeight={1.3}>
                Forgot your password?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Enter your email and we’ll send instructions to reset your password safely.
              </Typography>
            </Stack>
          </motion.div>

          <motion.div
            variants={formFieldVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <TextField
              name="email"
              label="Email address"
              type="email"
              required
              fullWidth
              autoComplete="email"
              InputLabelProps={{ shrink: true }}
            />
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 400 }}
            >
              <Alert severity="error" variant="outlined">
                {error}
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 400 }}
            >
              <Alert severity="success" variant="outlined">
                {success}
              </Alert>
            </motion.div>
          )}

          <motion.div variants={formFieldVariants}>
            <MotionButton
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 8px 20px rgba(91, 153, 194, 0.4)',
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <CircularProgress size={24} color="inherit" />
                </motion.div>
              ) : (
                'Send reset link'
              )}
            </MotionButton>
          </motion.div>
        </Stack>
      </motion.div>
    </AuthLayout>
  );
}
