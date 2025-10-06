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
import { styled, keyframes } from '@mui/material/styles'
import { register } from '../api/auth'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

// AI-themed animations
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`

// AI-themed SignUp styled components
const BackgroundContainer = styled(Box)(() => ({
  minHeight: '100vh',
  background: 'linear-gradient(-45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
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
}))

const FloatingIcon = styled(Avatar)(() => ({
  animation: `${float} 3s ease-in-out infinite`,
  width: '60px',
  height: '60px',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
  border: '2px solid rgba(255,255,255,0.3)',
  backdropFilter: 'blur(10px)',
  margin: '0 auto 20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
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
      boxShadow: '0 0 20px rgba(102, 126, 234, 0.4)',
      '& fieldset': {
        border: '2px solid rgba(102, 126, 234, 0.6)',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: '#fff',
    },
  },
  '& .MuiOutlinedInput-input': {
    color: '#fff',
  },
}))

const AIButton = styled(Button)(() => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
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
