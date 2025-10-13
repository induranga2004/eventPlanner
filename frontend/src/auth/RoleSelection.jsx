import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import StadiumRoundedIcon from '@mui/icons-material/StadiumRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { motion } from 'motion/react';
import { colorHunt } from '../theme';
import { pageVariants, cardHoverVariants } from '../utils/motionVariants';

const MotionCard = motion(Card);
const MotionButton = motion(Button);

const roles = [
  {
    key: 'user',
    title: 'Event Director',
    description: 'Design entire productions, coordinate talent, and manage clients with a single workspace.',
    icon: <EventAvailableRoundedIcon fontSize="large" />,
    highlights: ['All planning tools', 'Timeline automation', 'Client-ready exports'],
    cta: 'Build my event HQ',
  },
  {
    key: 'musician',
    title: 'Solo Musician',
    description: 'Showcase your setlists, availability, and rates to the right planners.',
    icon: <MusicNoteRoundedIcon fontSize="large" />,
    highlights: ['Curated gig leads', 'Portfolio pages', 'Smart availability'],
    cta: 'Join as musician',
  },
  {
    key: 'music_band',
    title: 'Music Ensemble',
    description: 'Coordinate band members, equipment lists, and performances in one place.',
    icon: <Groups2RoundedIcon fontSize="large" />,
    highlights: ['Multi-member scheduling', 'Tech rider storage', 'Payment tracking'],
    cta: 'Join as band',
  },
  {
    key: 'venue',
    title: 'Venue Host',
    description: 'Promote your rooms, manage inquiries, and confirm bookings with clarity.',
    icon: <StadiumRoundedIcon fontSize="large" />,
    highlights: ['Room specs & layouts', 'Hold/confirm flow', 'Analytics dashboard'],
    cta: 'List my venue',
  },
  {
    key: 'lights',
    title: 'Lighting Designer',
    description: 'Share lighting plots, equipment, and design looks ready for showtime.',
    icon: <LightModeRoundedIcon fontSize="large" />,
    highlights: ['Inventory profiles', 'Preset looks', 'Onsite checklists'],
    cta: 'Join lighting crew',
  },
  {
    key: 'sounds',
    title: 'Sound Specialist',
    description: 'Manage audio packages, technical riders, and communication with producers.',
    icon: <GraphicEqRoundedIcon fontSize="large" />,
    highlights: ['Mix templates', 'Gear manifests', 'Realtime updates'],
    cta: 'Join sound crew',
  },
];

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleSelect = (key) => {
    navigate(`/register/${key}`);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${colorHunt.darkPurpleBlue} 0%, ${colorHunt.mediumBlue} 100%)`,
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Stack spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} textAlign={{ xs: 'left', md: 'center' }}>
                <VerifiedRoundedIcon sx={{ fontSize: 40, color: colorHunt.lightBlue }} />
                <Typography 
                  variant="h3" 
                  component="h1" 
                  sx={{ 
                    maxWidth: 680,
                    color: colorHunt.cream,
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  Choose the role that matches how you bring events to life
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    maxWidth: 720,
                    color: colorHunt.cream,
                    opacity: 0.85,
                    lineHeight: 1.6,
                  }}
                >
                  Event Planner Studio connects directors, performers, venues, and production crews in one professional network.
                </Typography>
              </Stack>
            </motion.div>

            <Grid container spacing={3}>
              {roles.map((role, index) => (
                <Grid item xs={12} sm={6} md={4} key={role.key}>
                  <MotionCard
                    variants={cardHoverVariants}
                    initial="initial"
                    whileInView="whileInView"
                    whileHover="whileHover"
                    viewport={{ once: true }}
                    transition={{ 
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                    }}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: colorHunt.mediumBlue,
                      border: `1px solid rgba(91, 153, 194, 0.2)`,
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSelect(role.key)}
                  >
                    <CardHeader
                      avatar={
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2,
                            display: 'grid',
                            placeItems: 'center',
                            backgroundColor: `rgba(91, 153, 194, 0.2)`,
                            color: colorHunt.lightBlue,
                          }}
                        >
                          {role.icon}
                        </Box>
                      }
                      title={
                        <Typography 
                          variant="h5" 
                          fontWeight={700}
                          sx={{ color: colorHunt.cream }}
                        >
                          {role.title}
                        </Typography>
                      }
                      subheader={
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: colorHunt.cream,
                            opacity: 0.8,
                            lineHeight: 1.6,
                          }}
                        >
                          {role.description}
                        </Typography>
                      }
                      sx={{ pb: 0 }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack spacing={1.5} mt={2}>
                        {role.highlights.map((item) => (
                          <Chip
                            key={item}
                            label={item}
                            size="small"
                            variant="outlined"
                            sx={{
                              alignSelf: 'flex-start',
                              borderColor: `rgba(91, 153, 194, 0.4)`,
                              color: colorHunt.cream,
                              fontWeight: 500,
                              backgroundColor: 'rgba(91, 153, 194, 0.1)',
                            }}
                          />
                        ))}
                      </Stack>
                    </CardContent>
                    <Stack spacing={2} px={3} pb={3}>
                      <MotionButton
                        variant="contained"
                        endIcon={<ArrowForwardRoundedIcon />}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        sx={{
                          backgroundColor: colorHunt.lightBlue,
                          color: colorHunt.darkPurpleBlue,
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: colorHunt.lightBlue,
                            filter: 'brightness(1.1)',
                          },
                        }}
                      >
                        {role.cta}
                      </MotionButton>
                      <Button
                        variant="text"
                        component={RouterLink}
                        to="/login"
                        onClick={(e) => e.stopPropagation()}
                        sx={{ 
                          color: colorHunt.cream,
                          opacity: 0.7,
                          textTransform: 'none',
                          '&:hover': {
                            opacity: 1,
                          },
                        }}
                      >
                        Learn more about this workspace
                      </Button>
                    </Stack>
                  </MotionCard>
                </Grid>
              ))}
            </Grid>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Stack 
                direction={{ xs: 'column', md: 'row' }} 
                spacing={2} 
                justifyContent="center" 
                alignItems="center"
              >
                <Typography 
                  variant="body2" 
                  sx={{ color: colorHunt.cream, opacity: 0.8 }}
                >
                  Already collaborating with us?
                </Typography>
                <Button 
                  component={RouterLink} 
                  to="/login" 
                  variant="outlined"
                  sx={{
                    borderColor: colorHunt.lightBlue,
                    color: colorHunt.cream,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: colorHunt.lightBlue,
                      backgroundColor: 'rgba(91, 153, 194, 0.1)',
                    },
                  }}
                >
                  Sign in to your workspace
                </Button>
              </Stack>
            </motion.div>
          </Stack>
        </Container>
      </Box>
    </motion.div>
  );
};

export default RoleSelection;