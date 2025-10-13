import * as React from 'react';
import { useNavigate } from 'react-router-dom';
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
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import EmojiPeopleRoundedIcon from '@mui/icons-material/EmojiPeopleRounded';
import { motion } from 'motion/react';
import { register } from '../api/auth';
import AuthLayout from '../components/layout/AuthLayout';
import FileUploadField from '../components/common/FileUploadField';
import { formContainerVariants, formFieldVariants } from '../utils/motionVariants';

const MotionButton = motion(Button);

export default function MusicBandRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('role', 'music_band');

    setLoading(true);
    setError('');
    try {
      const res = await register(formData);
      if (res.token) localStorage.setItem('token', res.token);
      navigate('/me');
    } catch (e) {
      setError(e?.response?.data?.error || 'Registration failed. Please double-check your entries.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bring your ensemble to the Event Planner Studio network"
      subtitle="Keep every member in sync, manage stage plots, and confirm bookings with clarity."
      description="Tell us about your band and we'll connect you with the right productions."
      sideContent={
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <EmojiPeopleRoundedIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
            <Typography variant="body1" color="text.secondary">
              Share a single link with planners that includes your roster, tech needs, and media kit.
            </Typography>
          </Stack>
          <Stack spacing={1.5}>
            {["Centralize member schedules", "Store stage plots & riders", "Track deposits & payouts"].map((item) => (
              <Stack key={item} direction="row" spacing={1.5} alignItems="center" color="text.secondary">
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'secondary.main' }} />
                <Typography variant="body2">{item}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      }
      footer={
        <Button
          variant="text"
          color="inherit"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate('/register')}
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
                Band profile
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Complete profiles are featured in curated rosters and receive priority booking recommendations.
              </Typography>
            </Stack>
          </motion.div>

          <motion.div 
            variants={formFieldVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <TextField 
              name="bandName" 
              label="Band name" 
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

          <motion.div variants={formFieldVariants}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <TextField 
                    name="members" 
                    label="Number of members" 
                    type="number" 
                    inputProps={{ min: 1 }} 
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
                    name="genres" 
                    label="Primary genres" 
                    placeholder="Soul, funk, pop" 
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
              name="bio"
              label="Band story"
              placeholder="Share your performance style, accolades, and most requested sets."
              multiline
              rows={3}
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
                    name="spotifyLink" 
                    label="Streaming link" 
                    placeholder="Spotify or Apple Music" 
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
                    name="youtubeLink" 
                    label="Video reel" 
                    placeholder="YouTube or Vimeo" 
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
                    name="instagramLink" 
                    label="Instagram" 
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
              label="Band press photo"
              accept="image/*"
              helperText="High-resolution group image, min 2000px on the long edge."
              required
            />
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <FileUploadField
              name="additionalPhoto"
              label="On-stage photo (optional)"
              accept="image/*"
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
              startIcon={!loading && <QueueMusicIcon />}
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
                'Create band profile'
              )}
            </MotionButton>
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              After approval you can invite band members, upload stage plots, and configure payment splits.
            </Typography>
          </motion.div>
        </Stack>
      </motion.div>
    </AuthLayout>
  );
}