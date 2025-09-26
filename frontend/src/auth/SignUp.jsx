import * as React from 'react'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { register } from '../api/auth'
import { useNavigate, Link as RouterLink } from 'react-router-dom'

export default function SignUp() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [role, setRole] = React.useState('user')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const payload = {
      email: data.get('email'),
      password: data.get('password'),
      role,
      name: data.get('name'),
      phone: data.get('phone'),
      photo: data.get('photo'),
      spotifyLink: data.get('spotifyLink'),
      venueAddress: data.get('venueAddress'),
      capacity: data.get('capacity'),
    }
    setLoading(true)
    setError('')
    try {
      const res = await register(payload)
      if (res.token) localStorage.setItem('token', res.token)
      navigate('/me')
    } catch (e) {
      setError(e?.response?.data?.error || 'Register failed')
    } finally {
      setLoading(false)
    }
  }

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
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="name" label="Name" name="name" autoFocus />
          <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" />
          <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="new-password" />
          <TextField margin="normal" required select fullWidth id="role" label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="musician">Musician</MenuItem>
            <MenuItem value="venue">Venue</MenuItem>
          </TextField>
          {role === 'user' && (
            <TextField margin="normal" fullWidth id="phone" label="Phone Number" name="phone" />
          )}
          {role === 'musician' && (
            <>
              <TextField margin="normal" fullWidth id="phone" label="Phone Number" name="phone" />
              <TextField margin="normal" fullWidth id="photo" label="Photo URL" name="photo" />
              <TextField margin="normal" fullWidth id="spotifyLink" label="Spotify Link" name="spotifyLink" />
            </>
          )}
          {role === 'venue' && (
            <>
              <TextField margin="normal" fullWidth id="phone" label="Phone Number" name="phone" />
              <TextField margin="normal" fullWidth id="venueAddress" label="Venue Address" name="venueAddress" />
              <TextField margin="normal" fullWidth id="capacity" label="Capacity" name="capacity" type="number" />
            </>
          )}
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Signing up…' : 'Sign Up'}
          </Button>
          <Grid container>
            <Grid>
              <Link component={RouterLink} to="/login" variant="body2">
                {"Already have an account? Sign in"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  )
}
