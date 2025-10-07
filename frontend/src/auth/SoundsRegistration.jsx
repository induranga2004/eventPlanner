import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, CssBaseline, Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, Alert } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { register } from '../api/auth';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

// AI-themed animations for sounds
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`

const soundWave = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
  25% { transform: scale(1.2) rotate(3deg); opacity: 1; }
  50% { transform: scale(1.1) rotate(-2deg); opacity: 0.9; }
  75% { transform: scale(1.15) rotate(1deg); opacity: 1; }
`

// AI-themed styled components for sounds (blue theme)
const BackgroundContainer = styled(Box)(() => ({
  minHeight: '100vh',
  background: 'linear-gradient(-45deg, #1e3c72 0%, #2a5298 25%, #1e3c72 50%, #2a5298 75%, #1e3c72 100%)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 8s ease infinite`,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px 0',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    backdropFilter: 'blur(10px)',
  }
}))

const GlassPaper = styled(Box)(() => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '40px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  position: 'relative',
  zIndex: 1,
  maxWidth: '500px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
}))

const FloatingIcon = styled(Box)(() => ({
  animation: `${soundWave} 3s ease-in-out infinite`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '80px',
  height: '80px',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.3)',
  backdropFilter: 'blur(10px)',
  margin: '0 auto 20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 20px 40px rgba(79, 172, 254, 0.4)',
  }
}))

const AITextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.15)',
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.15)',
      boxShadow: '0 0 20px rgba(79, 172, 254, 0.4)',
      '& fieldset': {
        border: '2px solid rgba(79, 172, 254, 0.6)',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 600,
    '&.Mui-focused': {
      color: '#4facfe',
    }
  },
  '& .MuiInputBase-input': {
    color: '#fff',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.6)',
    }
  }
}))

const AIFormControl = styled(FormControl)(() => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.15)',
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.15)',
      boxShadow: '0 0 20px rgba(79, 172, 254, 0.4)',
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 600,
    '&.Mui-focused': {
      color: '#4facfe',
    }
  },
  '& .MuiChip-root': {
    background: 'rgba(79, 172, 254, 0.2)',
    color: '#fff',
    border: '1px solid rgba(79, 172, 254, 0.3)',
  }
}))

const AIButton = styled(Button)(() => ({
  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  color: '#fff',
  borderRadius: '12px',
  padding: '12px 0',
  fontSize: '16px',
  fontWeight: 600,
  textTransform: 'none',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(79, 172, 254, 0.4)',
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.5)',
  },
}))

const GradientText = styled(Typography)(() => ({
  background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 700,
  textAlign: 'center',
  marginBottom: '30px',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
}))

const FileUploadBox = styled(Box)(() => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  border: '2px dashed rgba(255, 255, 255, 0.3)',
  padding: '20px',
  textAlign: 'center',
  margin: '10px 0',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  '& input[type="file"]': {
    color: '#fff',
    width: '100%',
    '&::file-selector-button': {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '8px',
      padding: '8px 16px',
      marginRight: '10px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.2)',
      }
    }
  }
}))

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const soundEquipment = [
  'PA Systems', 'Microphones', 'Mixers', 'Amplifiers', 'Speakers', 'Subwoofers', 'Monitors', 'Audio Interfaces', 'Wireless Systems', 'Cables & Connectors', 'Audio Processors', 'Equalizers', 'Compressors', 'Effects Units', 'Recording Equipment'
];

const eventTypes = [
  'Weddings', 'Corporate Events', 'Concerts', 'Parties', 'Nightclubs', 'Theater', 'Dance Events', 'Festivals', 'Private Events', 'Conferences', 'Trade Shows', 'Birthday Parties', 'Anniversaries', 'Graduations', 'Holiday Events'
];

const services = [
  'Sound System Setup', 'Live Sound Mixing', 'Recording Services', 'Audio Equipment Rental', 'Sound Design', 'Audio Engineering', 'DJ Services', 'Karaoke Setup', 'Microphone Management', 'Sound Check', 'Audio Troubleshooting', 'Equipment Maintenance'
];

export default function SoundsRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [selectedEquipment, setSelectedEquipment] = React.useState([]);
  const [selectedEventTypes, setSelectedEventTypes] = React.useState([]);
  const [selectedServices, setSelectedServices] = React.useState([]);

  const handleEquipmentChange = (event) => {
    const value = event.target.value;
    setSelectedEquipment(typeof value === 'string' ? value.split(',') : value);
  };

  const handleEventTypeChange = (event) => {
    const value = event.target.value;
    setSelectedEventTypes(typeof value === 'string' ? value.split(',') : value);
  };

  const handleServicesChange = (event) => {
    const value = event.target.value;
    setSelectedServices(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('role', 'sounds');
    formData.append('equipment', selectedEquipment.join(','));
    formData.append('eventTypes', selectedEventTypes.join(','));
    formData.append('services', selectedServices.join(','));

    setLoading(true);
    setError('');
    try {
      const res = await register(formData);
      if (res.token) localStorage.setItem('token', res.token);
      navigate('/me');
    } catch (e) {
      setError(e?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundContainer>
      {/* Floating sound wave icons */}
      <FloatingIcon sx={{ position: 'absolute', top: '15%', left: '10%' }}>
        <VolumeUpIcon sx={{ fontSize: '60px', color: 'rgba(255,255,255,0.3)' }} />
      </FloatingIcon>
      <FloatingIcon sx={{ position: 'absolute', bottom: '20%', left: '20%' }}>
        <VolumeUpIcon sx={{ fontSize: '55px', color: 'rgba(255,255,255,0.25)' }} />
      </FloatingIcon>
      
      <GlassPaper>
        <FloatingIcon>
          <VolumeUpIcon sx={{ fontSize: '32px', color: '#fff' }} />
        </FloatingIcon>
        
        <GradientText variant="h4">
          Sound Services Registration
        </GradientText>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              background: 'rgba(244, 67, 54, 0.2)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: '#ff6b6b'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <AITextField margin="normal" required fullWidth id="companyName" label="Company/Business Name" name="companyName" autoFocus />
          <AITextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" />
          <AITextField margin="normal" fullWidth id="phone" label="Contact Phone" name="phone" />
          <AITextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="new-password" />
          <AITextField margin="normal" fullWidth id="contactPerson" label="Contact Person Name" name="contactPerson" />
          <AITextField margin="normal" fullWidth id="address" label="Business Address" name="address" multiline rows={2} />
          
          <AIFormControl sx={{ mt: 2, width: '100%' }}>
            <InputLabel id="equipment-label">Sound Equipment Types</InputLabel>
            <Select
              labelId="equipment-label"
              id="equipment"
              multiple
              value={selectedEquipment}
              onChange={handleEquipmentChange}
              input={<OutlinedInput label="Sound Equipment Types" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {soundEquipment.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </AIFormControl>

          <AIFormControl sx={{ mt: 2, width: '100%' }}>
            <InputLabel id="event-types-label">Event Types You Serve</InputLabel>
            <Select
              labelId="event-types-label"
              id="eventTypes"
              multiple
              value={selectedEventTypes}
              onChange={handleEventTypeChange}
              input={<OutlinedInput label="Event Types You Serve" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {eventTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </AIFormControl>

          <AIFormControl sx={{ mt: 2, width: '100%' }}>
            <InputLabel id="services-label">Services You Provide</InputLabel>
            <Select
              labelId="services-label"
              id="services"
              multiple
              value={selectedServices}
              onChange={handleServicesChange}
              input={<OutlinedInput label="Services You Provide" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {services.map((service) => (
                <MenuItem key={service} value={service}>
                  {service}
                </MenuItem>
              ))}
            </Select>
          </AIFormControl>

          <AITextField margin="normal" fullWidth id="experience" label="Years of Experience" name="experience" type="number" />
          <AITextField margin="normal" fullWidth id="crewSize" label="Crew Size Available" name="crewSize" type="number" />
          <AITextField margin="normal" fullWidth id="equipmentDetails" label="Equipment Inventory Details" name="equipmentDetails" multiline rows={3} placeholder="List your sound equipment and inventory with specifications" />
          <AITextField margin="normal" fullWidth id="bio" label="Company Bio" name="bio" multiline rows={3} placeholder="Tell us about your sound company" />
          <AITextField margin="normal" fullWidth id="website" label="Website URL" name="website" />
          <AITextField margin="normal" fullWidth id="instagramLink" label="Instagram Handle" name="instagramLink" />
          <AITextField margin="normal" fullWidth id="facebookLink" label="Facebook Page" name="facebookLink" />
          
          <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
            Upload Company Logo:
          </Typography>
          <FileUploadBox>
            <input type="file" name="logo" accept="image/*" />
          </FileUploadBox>
          
          <AIButton type="submit" fullWidth sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Registering…' : 'Register Sound Service'}
          </AIButton>
        </Box>
      </GlassPaper>
    </BackgroundContainer>
  );
}