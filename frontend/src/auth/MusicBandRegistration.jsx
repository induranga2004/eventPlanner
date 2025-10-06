import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, CssBaseline, Box, Typography, TextField, Button } from '@mui/material';
import { register } from '../api/auth';

export default function MusicBandRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('role', 'music_band');

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
          Music Band Registration
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="bandName" label="Band Name" name="bandName" autoFocus />
          <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" />
          <TextField margin="normal" fullWidth id="phone" label="Phone Number" name="phone" />
          <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="new-password" />
          <TextField margin="normal" fullWidth id="members" label="Band Members" name="members" placeholder="Number of members" type="number" />
          <TextField margin="normal" fullWidth id="genres" label="Music Genres" name="genres" placeholder="Rock, Pop, Jazz, etc." />
          <TextField margin="normal" fullWidth id="bio" label="Band Bio" name="bio" placeholder="Tell us about your band" multiline rows={3} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Upload Band Photo:
          </Typography>
          <input type="file" name="photo" accept="image/*" style={{ marginBottom: '16px' }} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Upload Additional Photo:
          </Typography>
          <input type="file" name="additionalPhoto" accept="image/*" style={{ marginBottom: '16px' }} />
          <TextField margin="normal" fullWidth id="spotifyLink" label="Spotify/Music Link" name="spotifyLink" />
          <TextField margin="normal" fullWidth id="youtubeLink" label="YouTube Link" name="youtubeLink" />
          <TextField margin="normal" fullWidth id="instagramLink" label="Instagram Link" name="instagramLink" />
          <TextField margin="normal" fullWidth id="facebookLink" label="Facebook Link" name="facebookLink" />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Registering…' : 'Register Band'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}