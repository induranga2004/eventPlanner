import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';
import SecurityIcon from '@mui/icons-material/Security';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { login } from '../api/auth';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import TwoFactorVerificationSimple from '../components/TwoFactorVerificationSimple';
import AuthLayout from '../components/layout/AuthLayout';
import { formFieldVariants, buttonVariants } from '../utils/motionVariants';
import { colorHunt } from '../theme';

const SubtleLink = styled(Link)(({ theme }) => ({
  fontWeight: 600,
  color: colorHunt.lightBlue,
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  transition: 'color 0.2s ease',
  '&:hover': {
    color: '#7FB3D5',
  },
}));

// Enhanced button with Motion
const MotionButton = motion(Button);

export default function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [show2FA, setShow2FA] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState('');
  const [tempToken, setTempToken] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);

      if (res.requires2FA) {
        setUserEmail(email);
        setTempToken(res.tempToken);
        setShow2FA(true);
        return;
      }

      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userRole', res.role);
        localStorage.setItem('user', JSON.stringify(res.user));
        navigate(`/${res.role}-dashboard`);
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'We couldn’t sign you in. Double-check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASuccess = (userData) => {
    localStorage.setItem('userRole', userData.user.role);
    localStorage.setItem('user', JSON.stringify(userData.user));
    navigate(`/${userData.user.role}-dashboard`);
  };

  const handle2FABack = () => {
    setShow2FA(false);
    setUserEmail('');
    setTempToken('');
    setError('');
  };

  if (show2FA) {
    return (
      <TwoFactorVerificationSimple
        email={userEmail}
        tempToken={tempToken}
        onSuccess={handle2FASuccess}
        onBack={handle2FABack}
      />
    );
  }

  return (
    <AuthLayout
      title="Welcome back to your event studio"
      subtitle="Plan show-stopping experiences, collaborate with your roster, and keep every gig on tempo."
      description="Sign in to continue orchestrating events with your team."
      footer={
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(249, 219, 186, 0.85)',
            fontSize: '0.95rem'
          }}
        >
          Need an account?{' '}
          <SubtleLink 
            component={RouterLink} 
            to="/register"
            sx={{ fontWeight: 600 }}
          >
            Start your free workspace
            <ChevronRightRoundedIcon fontSize="small" />
          </SubtleLink>
        </Typography>
      }
    >
      <Stack component="form" onSubmit={handleSubmit} spacing={3.5}>
        <motion.div variants={formFieldVariants}>
          <Stack spacing={1.5}>
            <Typography 
              variant="h4" 
              fontWeight={700} 
              color={colorHunt.cream}
              sx={{ letterSpacing: '-0.01em' }}
            >
              Sign in
            </Typography>
            <Typography 
              variant="body1" 
              color="rgba(249, 219, 186, 0.75)"
              sx={{ lineHeight: 1.6 }}
            >
              Use the email associated with your Event Planner Studio workspace.
            </Typography>
          </Stack>
        </motion.div>

        <motion.div 
          variants={formFieldVariants}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <TextField
            required
            fullWidth
            id="email"
            label="Work email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
          />
        </motion.div>

        <motion.div 
          variants={formFieldVariants}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <TextField
            required
            fullWidth
            id="password"
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
          />
        </motion.div>

        <motion.div variants={formFieldVariants}>
          <Stack 
            direction="row" 
            alignItems="center" 
            justifyContent="space-between"
            sx={{ mt: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <FormControlLabel
                control={<Checkbox color="primary" />}
                label={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(249, 219, 186, 0.85)',
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }}
                  >
                    Stay signed in
                  </Typography>
                }
              />
            </motion.div>
            <motion.div
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <SubtleLink 
                component={RouterLink} 
                to="/forgot-password"
                sx={{ fontSize: '0.9rem', fontWeight: 600 }}
              >
                Forgot password?
              </SubtleLink>
            </motion.div>
          </Stack>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 400 }}
          >
            <motion.div
              animate={{
                x: [0, -10, 10, -10, 10, 0],
              }}
              transition={{ duration: 0.5 }}
            >
              <Alert severity="error" variant="outlined">
                {error}
              </Alert>
            </motion.div>
          </motion.div>
        )}

        <motion.div variants={formFieldVariants}>
          <MotionButton
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            startIcon={!loading && <SecurityIcon />}
            endIcon={!loading && <ArrowForwardRoundedIcon />}
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
              'Sign in securely'
            )}
          </MotionButton>
        </motion.div>

        <motion.div variants={formFieldVariants}>
          <Typography 
            variant="caption" 
            color="rgba(249, 219, 186, 0.6)" 
            textAlign="center"
            sx={{ 
              display: 'block',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              mt: 1
            }}
          >
            By signing in you agree to our Terms of Service and Privacy Policy.
          </Typography>
        </motion.div>
      </Stack>
    </AuthLayout>
  );
}
