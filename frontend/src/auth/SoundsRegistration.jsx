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
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import { motion } from 'motion/react';
import { register } from '../api/auth';
import AuthLayout from '../components/layout/AuthLayout';
import FileUploadField from '../components/common/FileUploadField';
import { formContainerVariants, formFieldVariants } from '../utils/motionVariants';

const MotionButton = motion(Button);

export default function SoundsRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('role', 'sounds');

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
      title="Amplify events with Event Planner Studio"
      subtitle="Connect with event directors, showcase your audio expertise, and manage sound production seamlessly."
      description="Join a network of audio professionals and streamline bookings, equipment tracking, and project coordination."
      sideContent={
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <GraphicEqRoundedIcon sx={{ fontSize: 32, color: 'secondary.light' }} />
            <Typography variant="body1" color="text.secondary">
              Showcase your sound systems, equipment inventory, and portfolio of flawlessly executed events.
            </Typography>
          </Stack>
          <Stack spacing={1.5}>
            {['Equipment inventory & tracking', 'Crew scheduling & coordination', 'Project quotes & contracts', 'Client portfolio & reviews'].map((item) => (
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
                Sound service details
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Profiles with complete equipment lists and project portfolios receive 4 more inquiries.
              </Typography>
            </Stack>
          </motion.div>

          <motion.div 
            variants={formFieldVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <TextField 
              name="companyName" 
              label="Company/Business name" 
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
              name="phone" 
              label="Contact number" 
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
              name="contactPerson" 
              label="Primary contact person" 
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
              name="address" 
              label="Business address" 
              placeholder="Street, city, state, zip code"
              multiline
              rows={2}
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
                    name="crewSize" 
                    label="Crew size" 
                    type="number"
                    inputProps={{ min: 1 }}
                    placeholder="Number of engineers"
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
                    name="website" 
                    label="Website" 
                    placeholder="https://yourwebsite.com"
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
              name="equipment"
              label="Sound equipment"
              placeholder="PA systems, microphones, mixers, speakers, monitors, etc."
              multiline
              rows={2}
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
              name="eventTypes"
              label="Event specialties"
              placeholder="Weddings, concerts, corporate events, festivals, theater, etc."
              multiline
              rows={2}
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
              name="services"
              label="Services offered"
              placeholder="Sound system setup, live mixing, recording, equipment rental, audio engineering, etc."
              multiline
              rows={2}
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
              name="experience"
              label="Years of experience"
              type="number"
              inputProps={{ min: 0 }}
              placeholder="Total years in audio production"
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
                    name="instagramLink" 
                    label="Instagram" 
                    placeholder="@yourcompany"
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
                    name="facebookLink" 
                    label="Facebook" 
                    fullWidth 
                    InputLabelProps={{ shrink: true }}
                  />
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <FileUploadField
              name="photo"
              label="Service showcase photo"
              accept="image/*"
              helperText="High-resolution image of your sound setup or past event (JPG or PNG, max 10MB)."
              required
            />
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <FileUploadField
              name="additionalPhoto"
              label="Additional portfolio photo (optional)"
              accept="image/*"
              helperText="Show another project or equipment configuration."
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
              startIcon={!loading && <VolumeUpRoundedIcon />}
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
                'Register sound service'
              )}
            </MotionButton>
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              After approval, you'll access a dashboard to manage bookings, track equipment, and showcase your audio portfolio.
            </Typography>
          </motion.div>
        </Stack>
      </motion.div>
    </AuthLayout>
  );
}