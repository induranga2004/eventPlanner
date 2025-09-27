import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  CssBaseline, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Grid, 
  Paper,
  Divider,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  MusicNote as MusicIcon,
  Group as GroupIcon,
  LocationOn as VenueIcon,
  Lightbulb as LightIcon,
  VolumeUp as SoundIcon,
  Event as EventIcon
} from '@mui/icons-material';

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/register/${role}`);
  };

  const eventPlannerRole = {
    role: 'user',
    title: 'Event Planner',
    description: 'Looking to plan and organize events',
    icon: <EventIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    color: 'primary',
    features: ['Plan events', 'Find vendors', 'Manage bookings', 'Track progress']
  };

  const serviceProviderRoles = [
    {
      role: 'musician',
      title: 'Musician',
      description: 'Individual music performer',
      icon: <MusicIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: 'secondary',
      features: ['Solo performances', 'Music expertise', 'Portfolio showcase']
    },
    {
      role: 'music_band',
      title: 'Music Band',
      description: 'Group music performance',
      icon: <GroupIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: 'secondary',
      features: ['Band performances', 'Multiple genres', 'Equipment included']
    },
    {
      role: 'venue',
      title: 'Venue Owner',
      description: 'Event space provider',
      icon: <VenueIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success',
      features: ['Event spaces', 'Capacity options', 'Location services']
    },
    {
      role: 'lights',
      title: 'Lighting Services',
      description: 'Professional lighting solutions',
      icon: <LightIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning',
      features: ['LED systems', 'Stage lighting', 'Event ambiance']
    },
    {
      role: 'sounds',
      title: 'Sound Services',
      description: 'Audio and sound equipment',
      icon: <SoundIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info',
      features: ['PA systems', 'Sound mixing', 'Audio equipment']
    }
  ];

  const RoleCard = ({ role, title, description, icon, color, features }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 3 }}>
        <Box sx={{ mb: 2 }}>
          {icon}
        </Box>
        <Typography variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
          {features.map((feature, index) => (
            <Chip 
              key={index} 
              label={feature} 
              size="small" 
              variant="outlined"
              color={color}
            />
          ))}
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          fullWidth 
          variant="contained" 
          color={color}
          onClick={() => handleRoleSelect(role)}
          sx={{ 
            py: 1.5,
            fontWeight: 'bold',
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          Register as {title}
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out;
          }
        `}
      </style>
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h3" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }} className="fade-in-up">
          Join EventP
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, textAlign: 'center', maxWidth: 600 }} className="fade-in-up">
          Choose your role to get started. Whether you're planning events or providing services, 
          we have the perfect platform for you.
        </Typography>

        {/* Event Planner Section */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4, 
            width: '100%', 
            maxWidth: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              pointerEvents: 'none'
            }
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
            <PersonIcon sx={{ fontSize: 60, mb: 2, animation: 'pulse 2s infinite' }} />
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              {eventPlannerRole.title}
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              {eventPlannerRole.description}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 3 }}>
              {eventPlannerRole.features.map((feature, index) => (
                <Chip 
                  key={index} 
                  label={feature} 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                />
              ))}
            </Box>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => handleRoleSelect(eventPlannerRole.role)}
              sx={{ 
                py: 2, 
                px: 4,
                backgroundColor: 'white',
                color: 'primary.main',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }
              }}
            >
              Start Planning Events
            </Button>
          </Box>
        </Paper>

        {/* Service Providers Section */}
        <Box sx={{ width: '100%' }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 1, fontWeight: 'bold' }}>
            Service Providers
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
            Offer your services to event planners
          </Typography>
          
          <Divider sx={{ mb: 4 }} />
          
          <Grid container spacing={3}>
            {serviceProviderRoles.map((role) => (
              <Grid item xs={12} sm={6} md={4} key={role.role}>
                <RoleCard {...role} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Additional Info */}
        <Box sx={{ mt: 6, textAlign: 'center', maxWidth: 600 }}>
          <Typography variant="body1" color="text.secondary">
            Not sure which role fits you? 
            <Button 
              variant="text" 
              color="primary" 
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              Contact our support team
            </Button>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}