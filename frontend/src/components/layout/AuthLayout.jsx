import React from 'react';
import { Box, Container, Grid, Paper, Typography, Stack, Divider, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'motion/react';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import MoodRoundedIcon from '@mui/icons-material/MoodRounded';
import { pageVariants, formContainerVariants } from '../../utils/motionVariants';
import { colorHunt } from '../../theme';

const highlightItems = [
  {
    icon: <MusicNoteRoundedIcon fontSize="large" />,
    label: 'Curated for musicians & venues',
  },
  {
    icon: <Diversity3RoundedIcon fontSize="large" />,
    label: 'Collaborate with your creative crew',
  },
  {
    icon: <ScheduleRoundedIcon fontSize="large" />,
    label: 'Keep every booking on tempo',
  },
  {
    icon: <MoodRoundedIcon fontSize="large" />,
    label: 'Client-ready experiences out of the box',
  },
];

const AuthLayout = ({
  title,
  subtitle,
  description,
  sideContent,
  children,
  footer,
}) => {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        backgroundColor: colorHunt.darkPurpleBlue,
        backgroundImage: `radial-gradient(circle at 20% 20%, rgba(91, 153, 194, 0.15), transparent 60%),
                         radial-gradient(circle at 80% 80%, rgba(26, 72, 112, 0.2), transparent 60%)`,
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid
          container
          spacing={{ xs: 6, md: 8 }}
          justifyContent="center"
          alignItems={{ xs: 'start', md: 'center' }}
        >
          <Grid item xs={12} md={6}>
            <motion.div
              initial="initial"
              animate="animate"
              variants={pageVariants}
            >
              <Stack spacing={4} sx={{ color: colorHunt.cream }}>
                <Stack spacing={2.5}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ color: colorHunt.lightBlue }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: colorHunt.lightBlue,
                      }}
                    />
                    <Typography 
                      variant="overline" 
                      fontWeight={700} 
                      letterSpacing={2.5}
                      sx={{ fontSize: '0.7rem' }}
                    >
                      Event Planner Studio
                    </Typography>
                  </Stack>
                  <Typography 
                    variant="h3" 
                    component="h1" 
                    sx={{ 
                      maxWidth: 520, 
                      color: colorHunt.cream,
                      lineHeight: 1.2,
                      fontWeight: 700,
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {title}
                  </Typography>
                  {subtitle && (
                    <Typography
                      variant="h6"
                      sx={{ 
                        color: 'rgba(249, 219, 186, 0.85)', 
                        fontWeight: 500, 
                        maxWidth: 520,
                        lineHeight: 1.5,
                        fontSize: '1.1rem'
                      }}
                    >
                      {subtitle}
                    </Typography>
                  )}
                  {description && (
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        maxWidth: 560, 
                        color: 'rgba(249, 219, 186, 0.7)',
                        lineHeight: 1.7,
                        fontSize: '0.95rem'
                      }}
                    >
                      {description}
                    </Typography>
                  )}
                </Stack>

                {sideContent || (
                  <Paper
                    variant="outlined"
                    sx={{
                      px: 3,
                      py: 2.5,
                      backgroundColor: 'rgba(26, 72, 112, 0.4)',
                      borderColor: 'rgba(249, 219, 186, 0.15)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 2.5, sm: 3 }}
                      divider={
                        <Divider
                          orientation={isSmUp ? 'vertical' : 'horizontal'}
                          flexItem
                          sx={{ borderColor: 'rgba(249, 219, 186, 0.15)' }}
                        />
                      }
                    >
                      {highlightItems.map((item) => (
                        <Stack key={item.label} spacing={1} direction="row" alignItems="center">
                          <Box
                            sx={{
                              bgcolor: 'rgba(91, 153, 194, 0.2)',
                              color: colorHunt.lightBlue,
                              borderRadius: 2,
                              width: 48,
                              height: 48,
                              display: 'grid',
                              placeItems: 'center',
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Typography variant="body2" color="rgba(249, 219, 186, 0.85)" sx={{ maxWidth: 160 }}>
                            {item.label}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={formContainerVariants}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3.5, md: 4.5 },
                  borderRadius: 4,
                  backgroundColor: colorHunt.mediumBlue,
                  border: `1px solid rgba(249, 219, 186, 0.15)`,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                {children}
              </Paper>

              {footer && (
                <Box 
                  mt={3.5} 
                  textAlign="center" 
                  color="rgba(249, 219, 186, 0.85)"
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: '0.95rem',
                      lineHeight: 1.6
                    }
                  }}
                >
                  {footer}
                </Box>
              )}
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AuthLayout;
