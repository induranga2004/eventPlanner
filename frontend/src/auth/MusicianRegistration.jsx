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
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import HeadphonesRoundedIcon from '@mui/icons-material/HeadphonesRounded';
import { motion } from 'motion/react';
import { register } from '../api/auth';
import AuthLayout from '../components/layout/AuthLayout';
import FileUploadField from '../components/common/FileUploadField';
import { formContainerVariants, formFieldVariants } from '../utils/motionVariants';

const MotionButton = motion(Button);

export default function MusicianRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('role', 'musician');

    setLoading(true);
    setError('');
    try {
      const res = await register(formData);
      if (res.token) localStorage.setItem('token', res.token);
      navigate('/me');
    } catch (e) {
      setError(e?.response?.data?.error || 'Registration failed. Please review the highlighted fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join the Event Planner Studio artist roster"
      subtitle="Share your sound, manage your bookings, and collaborate with directors." 
      description="Tell us about your artistry so we can match you with events that fit your vibe."
      sideContent={
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <HeadphonesRoundedIcon sx={{ fontSize: 32, color: 'tertiary.main' }} />
            <Typography variant="body1" color="text.secondary">
              Keep your schedule, riders, and team communication aligned in one place.
            </Typography>
          </Stack>
          <Grid container spacing={1.5}>
            {['Setlist library', 'Showcase portfolio', 'Gig analytics', 'Instant holds'].map((item) => (
              <Grid item xs={6} key={item}>
                <Box
                  sx={{
                    borderRadius: 2,
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    p: 1.5,
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="caption" fontWeight={600}>
                    {item}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
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
                Artist details
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Profiles with complete details land 3 more gigs. Highlight what makes your performances unique.
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
              label="Artist or stage name" 
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

          <motion.div variants={formFieldVariants}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <TextField 
                    name="experience" 
                    label="Years performing" 
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
                    name="hourlyRate" 
                    label="Standard rate" 
                    placeholder="USD" 
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
              name="portfolio"
              label="Portfolio links"
              placeholder="Website, EPK, highlight reel"
              multiline
              rows={3}
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
              name="spotifyLink"
              label="Streaming profile"
              placeholder="Spotify, Apple Music, or SoundCloud"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <FileUploadField
              name="photo"
              label="Primary press photo"
              accept="image/*"
              helperText="Upload a high-resolution image (JPG or PNG, max 10MB)."
              required
            />
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <FileUploadField
              name="additionalPhoto"
              label="Additional imagery (optional)"
              accept="image/*"
              helperText="Add a live performance shot or alternate look."
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
              startIcon={!loading && <MusicNoteRoundedIcon />}
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
                'Create musician profile'
              )}
            </MotionButton>
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Once approved, you''ll receive an onboarding kit to keep your tech riders, contracts, and settlements on beat.
            </Typography>
          </motion.div>
        </Stack>
      </motion.div>
    </AuthLayout>
  );
}