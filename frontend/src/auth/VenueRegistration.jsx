import * as React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import StadiumRoundedIcon from '@mui/icons-material/StadiumRounded';
import { motion } from 'motion/react';
import { register } from '../api/auth';
import AuthLayout from '../components/layout/AuthLayout';
import FileUploadField from '../components/common/FileUploadField';
import { formContainerVariants, formFieldVariants } from '../utils/motionVariants';

const MotionButton = motion(Button);

export default function VenueRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('role', 'venue');

    setLoading(true);
    setError('');
    try {
      const res = await register(formData);
      if (res.token) localStorage.setItem('token', res.token);
      navigate('/me');
    } catch (e) {
      setError(e?.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="List your venue on Event Planner Studio"
  subtitle="Connect with event planners, showcase your space, and streamline bookings."
      description="Join a network of premiere venues and manage inquiries, holds, and contracts in one platform."
      sideContent={
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <LocationOnRoundedIcon sx={{ fontSize: 32, color: 'secondary.light' }} />
            <Typography variant="body1" color="text.secondary">
              Highlight your space's unique features with stunning imagery and detailed specifications.
            </Typography>
          </Stack>
          <Stack spacing={1.5}>
            {['Calendar sync & availability', 'Instant booking holds', 'Integrated contracts & deposits', 'Performance analytics'].map((item) => (
              <Stack
                key={item}
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ color: 'text.secondary' }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: 'secondary.main',
                  }}
                />
                <Typography variant="body2">{item}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      }
      footer={
        <Button
          component={RouterLink}
          to="/register"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ color: 'text.secondary' }}
        >
          Back to role directory
        </Button>
      }
    >
      <motion.div
        variants={formContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <Stack component="form" onSubmit={handleSubmit} spacing={3}>
          <motion.div variants={formFieldVariants}>
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={700} lineHeight={1.3}>
                Venue information
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Profiles with high-quality photos and complete details receive 5 more inquiries.
              </Typography>
            </Stack>
          </motion.div>

          <motion.div 
            variants={formFieldVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <TextField 
              name="name" 
              label="Venue name" 
              required 
              autoFocus 
              fullWidth 
              InputLabelProps={{ shrink: true }}
            />
          </motion.div>

          <motion.div 
            variants={formFieldVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <TextField 
              name="email" 
              label="Primary contact email" 
              type="email" 
              required 
              fullWidth 
              InputLabelProps={{ shrink: true }}
            />
          </motion.div>

          <motion.div 
            variants={formFieldVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <TextField 
              name="password" 
              label="Password" 
              type="password" 
              required 
              fullWidth 
              InputLabelProps={{ shrink: true }}
            />
          </motion.div>

          <motion.div 
            variants={formFieldVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <TextField 
              name="venueAddress" 
              label="Full venue address" 
              placeholder="Street, city, state, zip code"
              fullWidth 
              InputLabelProps={{ shrink: true }}
            />
          </motion.div>

          <motion.div 
            variants={formFieldVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <TextField 
              name="standardRate" 
              label="Starting fee (LKR)" 
              placeholder="e.g., 500000" 
              type="number"
              required
              fullWidth 
              InputLabelProps={{ shrink: true }}
            />
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <TextField 
                    name="capacity" 
                    label="Maximum capacity" 
                    type="number"
                    inputProps={{ min: 1 }}
                    placeholder="Total guest capacity"
                    fullWidth 
                    InputLabelProps={{ shrink: true }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <TextField 
                    name="venueType" 
                    label="Venue type" 
                    placeholder="Theater, ballroom, arena"
                    fullWidth 
                    InputLabelProps={{ shrink: true }}
                  />
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>

          <motion.div 
            variants={formFieldVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <TextField 
              name="facebookUrl" 
              label="Website or social media" 
              placeholder="Facebook, Instagram, or venue website"
              fullWidth 
              InputLabelProps={{ shrink: true }}
            />
          </motion.div>

          <motion.div 
            variants={formFieldVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <TextField
              name="description"
              label="Venue description"
              placeholder="Highlight your space's unique features, amenities, and ideal event types"
              multiline
              rows={3}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <FileUploadField
              name="photo"
              label="Primary venue photo"
              accept="image/*"
              helperText="High-resolution image showcasing your main space (JPG or PNG, max 10MB)."
              required
            />
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <FileUploadField
              name="additionalPhoto"
              label="Additional venue photo (optional)"
              accept="image/*"
              helperText="Show another angle, setup style, or event in progress."
            />
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
              startIcon={!loading && <StadiumRoundedIcon />}
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
                'Join as venue owner'
              )}
            </MotionButton>
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              After approval, you'll access a dashboard to manage bookings, track inquiries, and upload floor plans.
            </Typography>
          </motion.div>
        </Stack>
      </motion.div>
    </AuthLayout>
  );
}