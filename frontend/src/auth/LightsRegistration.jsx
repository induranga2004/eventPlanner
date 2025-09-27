import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, CssBaseline, Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput } from '@mui/material';
import { register } from '../api/auth';

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

const lightTypes = [
  'LED Strips', 'Spotlights', 'Moving Head Lights', 'Laser Lights', 'Fog Machines', 'Haze Machines', 'Strobe Lights', 'UV Lights', 'Stage Washers', 'Follow Spots', 'Par Cans', 'Beam Lights', 'Flood Lights', 'Pin Spots', 'Gobo Projectors'
];

const eventTypes = [
  'Weddings', 'Corporate Events', 'Concerts', 'Parties', 'Nightclubs', 'Theater', 'Dance Events', 'Festivals', 'Private Events', 'Conferences', 'Trade Shows', 'Birthday Parties', 'Anniversaries', 'Graduations', 'Holiday Events'
];

export default function LightsRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [selectedLightTypes, setSelectedLightTypes] = React.useState([]);
  const [selectedEventTypes, setSelectedEventTypes] = React.useState([]);

  const handleLightTypeChange = (event) => {
    const value = event.target.value;
    setSelectedLightTypes(typeof value === 'string' ? value.split(',') : value);
  };

  const handleEventTypeChange = (event) => {
    const value = event.target.value;
    setSelectedEventTypes(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('role', 'lights');
    formData.append('lightTypes', selectedLightTypes.join(','));
    formData.append('eventTypes', selectedEventTypes.join(','));

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
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Lighting Services Registration
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="companyName" label="Company/Business Name" name="companyName" autoFocus />
          <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" />
          <TextField margin="normal" fullWidth id="phone" label="Contact Phone" name="phone" />
          <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="new-password" />
          <TextField margin="normal" fullWidth id="contactPerson" label="Contact Person Name" name="contactPerson" />
          <TextField margin="normal" fullWidth id="address" label="Business Address" name="address" multiline rows={2} />
          
          <FormControl sx={{ mt: 2, width: '100%' }}>
            <InputLabel id="light-types-label">Lighting Equipment Types</InputLabel>
            <Select
              labelId="light-types-label"
              id="lightTypes"
              multiple
              value={selectedLightTypes}
              onChange={handleLightTypeChange}
              input={<OutlinedInput label="Lighting Equipment Types" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {lightTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ mt: 2, width: '100%' }}>
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
          </FormControl>

          <TextField margin="normal" fullWidth id="experience" label="Years of Experience" name="experience" type="number" />
          <TextField margin="normal" fullWidth id="crewSize" label="Crew Size Available" name="crewSize" type="number" />
          <TextField margin="normal" fullWidth id="equipment" label="Equipment Inventory" name="equipment" multiline rows={3} placeholder="List your lighting equipment and inventory" />
          <TextField margin="normal" fullWidth id="services" label="Services Offered" name="services" multiline rows={3} placeholder="Describe your lighting services (setup, operation, design, etc.)" />
          <TextField margin="normal" fullWidth id="bio" label="Company Bio" name="bio" multiline rows={3} placeholder="Tell us about your lighting company" />
          <TextField margin="normal" fullWidth id="website" label="Website URL" name="website" />
          <TextField margin="normal" fullWidth id="instagramLink" label="Instagram Handle" name="instagramLink" />
          <TextField margin="normal" fullWidth id="facebookLink" label="Facebook Page" name="facebookLink" />
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Upload Company Logo:
          </Typography>
          <input type="file" name="logo" accept="image/*" style={{ marginBottom: '16px' }} />
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Upload Portfolio Photos:
          </Typography>
          <input type="file" name="photo" accept="image/*" style={{ marginBottom: '16px' }} />
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Upload Additional Photos:
          </Typography>
          <input type="file" name="additionalPhoto" accept="image/*" style={{ marginBottom: '16px' }} />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Registering…' : 'Register Lighting Service'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
