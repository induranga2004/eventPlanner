import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, CssBaseline, Box, Typography, TextField, Button } from '@mui/material';
import { register } from '../api/auth';

export default function LightsRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('role', 'lights');

    // Debugging: Log FormData entries
    console.log('FormData entries:', [...formData.entries()]);

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
          <TextField margin="normal" required fullWidth id="companyName" label="Company/Service Name" name="companyName" autoFocus />
          <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" />
          <TextField margin="normal" fullWidth id="phone" label="Phone Number" name="phone" />
          <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="new-password" />
          <TextField margin="normal" fullWidth id="contactPerson" label="Contact Person" name="contactPerson" />
          <TextField margin="normal" fullWidth id="address" label="Business Address" name="address" />
          <TextField margin="normal" fullWidth id="lightTypes" label="Lighting Equipment Types" name="lightTypes" placeholder="LED, Stage lights, Ambient lighting, etc." multiline rows={2} />
          <TextField margin="normal" fullWidth id="eventTypes" label="Event Types" name="eventTypes" placeholder="Weddings, Concerts, Corporate events, etc." multiline rows={2} />
          <TextField margin="normal" fullWidth id="crewSize" label="Crew Size" name="crewSize" type="number" />
          <TextField margin="normal" fullWidth id="services" label="Services Offered" name="services" placeholder="Setup, Operation, Design consultation, etc." multiline rows={2} />
          <TextField margin="normal" fullWidth id="website" label="Website" name="website" placeholder="https://yourwebsite.com" />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Upload Service Photo:
          </Typography>
          <input type="file" name="photo" accept="image/*" style={{ marginBottom: '16px' }} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Upload Additional Photo:
          </Typography>
          <input type="file" name="additionalPhoto" accept="image/*" style={{ marginBottom: '16px' }} />
          <TextField margin="normal" fullWidth id="instagramLink" label="Instagram Link" name="instagramLink" />
          <TextField margin="normal" fullWidth id="facebookLink" label="Facebook Link" name="facebookLink" />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Registering…' : 'Register Service'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}