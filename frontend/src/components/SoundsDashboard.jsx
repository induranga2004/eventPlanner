import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Avatar, Grid, Chip, Button, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import ProBadge from './ProBadge';
import UpgradeModal from './UpgradeModal';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useSubscription, useProAccess } from '../hooks/useSubscription';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import MicIcon from '@mui/icons-material/Mic';
import SpeakerIcon from '@mui/icons-material/Speaker';
import StarIcon from '@mui/icons-material/Star';
import InsightsIcon from '@mui/icons-material/Insights';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LockIcon from '@mui/icons-material/Lock';

// Create Motion components
const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);
const MotionGrid = motion.create(Grid);

// Color Hunt styled components
const ProfileCard = styled(MotionPaper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1A4870 0%, #1F316F 100%)',
  border: '1px solid rgba(91, 153, 194, 0.3)',
  borderRadius: '20px',
  color: '#F9DBBA',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
}));

const InfoCard = styled(MotionPaper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1A4870 0%, #1F316F 100%)',
  border: '1px solid rgba(91, 153, 194, 0.3)',
  borderRadius: '16px',
  color: '#F9DBBA',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
}));

const SoundsIconBox = styled(MotionBox)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(91, 153, 194, 0.2)',
  borderRadius: '12px',
  border: '1px solid rgba(91, 153, 194, 0.4)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #5B99C2 0%, #1A4870 100%)',
  color: '#F9DBBA',
  border: '1px solid rgba(91, 153, 194, 0.4)',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  padding: '10px 24px',
  '&.MuiButton-outlined': {
    background: 'transparent',
    border: '1px solid rgba(91, 153, 194, 0.5)',
    '&:hover': {
      background: 'rgba(91, 153, 194, 0.15)',
      border: '1px solid #5B99C2',
    }
  }
}));

const InfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 0',
  borderBottom: '1px solid rgba(91, 153, 194, 0.2)',
  '&:last-child': {
    borderBottom: 'none',
  }
}));

export default function SoundsDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try { 
        // First, try to get user data from localStorage (set during login/2FA)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setLoading(false);
          return;
        }
        
        // Fallback to API call if no stored user data
        const data = await me(); 
        setUser(data.user); 
      } catch { 
        navigate('/login'); 
      } finally { 
        setLoading(false); 
      }
    })();
  }, [navigate]);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, []);

  if (loading) return <Container><Typography>Loading...</Typography></Container>;
  if (!user) return <Container><Typography>User not found</Typography></Container>;

  return (
  <DashboardLayout title="Sound Services Dashboard" navItems={[{ label: 'Profile', to: '/me' }]} role="sounds"> 
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Profile Header with Color Hunt blue gradient */}
        <ProfileCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ mb: 3, p: 0 }}
        >
          <Box sx={{
            background: 'linear-gradient(90deg, #5B99C2, #1A4870)',
            color: '#F9DBBA',
            p: 3,
            display: 'flex',
            alignItems: 'center',
          }}>
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Avatar 
                sx={{ 
                  width: 84, 
                  height: 84, 
                  mr: 3, 
                  border: '3px solid rgba(91, 153, 194, 0.5)',
                  bgcolor: '#1A4870'
                }}
              >
                {user.companyName?.charAt(0)?.toUpperCase() || user.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </motion.div>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#F9DBBA' }}>
                {user.companyName || user.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(249, 219, 186, 0.85)' }}>
                Sound & Audio Services
              </Typography>
            </Box>
            <Box flex={1} />
            <ActionButton variant="outlined">
              Manage
            </ActionButton>
          </Box>
        </ProfileCard>

        <Fade in={mounted} timeout={420}>
          <Box>
            {/* Stats Grid with stagger animations */}
            <Grid container spacing={3} sx={{ mb: 2 }}>
              <MotionGrid 
                item xs={12} sm={6} md={3}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <StatCard title="Gigs" value="—" subtitle="This month" />
              </MotionGrid>
              <MotionGrid 
                item xs={12} sm={6} md={3}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <StatCard title="Equipment" value={user.equipmentDetails ? 'Listed' : '—'} subtitle="Inventory" />
              </MotionGrid>
              <MotionGrid 
                item xs={12} sm={6} md={3}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <StatCard title="Services" value={user.services ? 'Listed' : '—'} subtitle="Offered" />
              </MotionGrid>
              <MotionGrid 
                item xs={12} sm={6} md={3}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <StatCard title="Since" value={new Date(user.createdAt).toLocaleDateString()} />
              </MotionGrid>
            </Grid>

            {/* Equipment Details with Color Hunt */}
            <InfoCard 
              elevation={3} 
              sx={{ p: 4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoCard elevation={1} sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <SoundsIconBox
                        sx={{ width: 48, height: 48 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <SpeakerIcon sx={{ fontSize: 28, color: '#5B99C2' }} />
                      </SoundsIconBox>
                      <Typography variant="h6" sx={{ color: '#F9DBBA', fontWeight: 600 }}>
                        Equipment
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(249, 219, 186, 0.7)', mb: 1 }}>
                      Inventory
                    </Typography>
                    <Typography sx={{ color: '#F9DBBA', fontSize: '1.1rem', fontWeight: 500 }}>
                      {user.equipmentDetails || '—'}
                    </Typography>
                  </InfoCard>
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard elevation={1} sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <SoundsIconBox
                        sx={{ width: 48, height: 48 }}
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <VolumeUpIcon sx={{ fontSize: 28, color: '#5B99C2' }} />
                      </SoundsIconBox>
                      <Typography variant="h6" sx={{ color: '#F9DBBA', fontWeight: 600 }}>
                        Quick Actions
                      </Typography>
                    </Box>
                    <ActionButton 
                      fullWidth
                      onClick={() => navigate('/me')}
                      component={motion.button}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Manage Sound
                    </ActionButton>
                  </InfoCard>
                </Grid>
              </Grid>
            </InfoCard>
          </Box>
        </Fade>
      </Container>
    </DashboardLayout>
  );
}
