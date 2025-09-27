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

const genres = [
  'Rock', 'Pop', 'Jazz', 'Blues', 'Country', 'Classical', 'Electronic', 'Hip-Hop', 'R&B', 'Folk', 'Reggae', 'Metal', 'Punk', 'Alternative', 'Indie'
];

export default function MusicBandRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [selectedGenres, setSelectedGenres] = React.useState([]);

  const handleGenreChange = (event) => {
    const value = event.target.value;
    setSelectedGenres(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('role', 'music_band');
    formData.append('genres', selectedGenres.join(','));

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
          <TextField margin="normal" fullWidth id="phone" label="Contact Phone" name="phone" />
          <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="new-password" />
          
          <FormControl sx={{ mt: 2, width: '100%' }}>
            <InputLabel id="genres-label">Music Genres</InputLabel>
            <Select
              labelId="genres-label"
              id="genres"
              multiple
              value={selectedGenres}
              onChange={handleGenreChange}
              input={<OutlinedInput label="Music Genres" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {genres.map((genre) => (
                <MenuItem key={genre} value={genre}>
                  {genre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField margin="normal" fullWidth id="members" label="Number of Band Members" name="members" type="number" />
          <TextField margin="normal" fullWidth id="experience" label="Years of Experience" name="experience" type="number" />
          <TextField margin="normal" fullWidth id="equipment" label="Equipment Owned" name="equipment" multiline rows={3} placeholder="List your equipment (instruments, amplifiers, etc.)" />
          <TextField margin="normal" fullWidth id="bio" label="Band Bio" name="bio" multiline rows={3} placeholder="Tell us about your band" />
          <TextField margin="normal" fullWidth id="spotifyLink" label="Spotify/Apple Music Link" name="spotifyLink" />
          <TextField margin="normal" fullWidth id="youtubeLink" label="YouTube Channel" name="youtubeLink" />
          <TextField margin="normal" fullWidth id="instagramLink" label="Instagram Handle" name="instagramLink" />
          <TextField margin="normal" fullWidth id="facebookLink" label="Facebook Page" name="facebookLink" />
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Upload Band Photo:
          </Typography>
          <input type="file" name="photo" accept="image/*" style={{ marginBottom: '16px' }} />
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Upload Additional Photos:
          </Typography>
          <input type="file" name="additionalPhoto" accept="image/*" style={{ marginBottom: '16px' }} />
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Upload Band Logo:
          </Typography>
          <input type="file" name="logo" accept="image/*" style={{ marginBottom: '16px' }} />

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
