import * as React from 'react'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import { styled, keyframes } from '@mui/material/styles'
import { login } from '../api/auth'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import SecurityIcon from '@mui/icons-material/Security'
import TwoFactorVerificationSimple from '../components/TwoFactorVerificationSimple'

// Animated gradient background
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(1deg); }
  66% { transform: translateY(5px) rotate(-1deg); }
`

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(138, 43, 226, 0.3); }
  50% { box-shadow: 0 0 40px rgba(138, 43, 226, 0.6), 0 0 60px rgba(138, 43, 226, 0.3); }
`

const BackgroundContainer = styled(Box)`
  min-height: 100vh;
  background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe);
  background-size: 400% 400%;
  animation: ${gradientShift} 15s ease infinite;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
  }
`

const FloatingIcon = styled(Box)`
  position: absolute;
  animation: ${floatAnimation} 6s ease-in-out infinite;
  opacity: 0.1;
  
  &:nth-of-type(1) { top: 10%; left: 10%; animation-delay: 0s; }
  &:nth-of-type(2) { top: 20%; right: 10%; animation-delay: 2s; }
  &:nth-of-type(3) { bottom: 30%; left: 15%; animation-delay: 4s; }
  &:nth-of-type(4) { bottom: 20%; right: 20%; animation-delay: 1s; }
`

const GlassPaper = styled(Paper)`
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  padding: 40px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  }
`

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.95);
      transform: translateY(-2px);
    }
    
    &.Mui-focused {
      background: rgba(255, 255, 255, 1);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
  }
  
  & .MuiInputLabel-root {
    color: rgba(0, 0, 0, 0.7);
    font-weight: 500;
  }
`

const AIButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 1.1rem;
  text-transform: none;
  position: relative;
  overflow: hidden;
  animation: ${pulseGlow} 3s ease-in-out infinite;
  
  &:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
`

const LogoContainer = styled(Box)`
  position: relative;
  margin-bottom: 24px;
  
  & .logo-icon {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    width: 80px;
    height: 80px;
    border-radius: 20px;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    animation: ${pulseGlow} 4s ease-in-out infinite;
  }
`

export default function SignIn() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [show2FA, setShow2FA] = React.useState(false)
  const [userEmail, setUserEmail] = React.useState('')
  const [tempToken, setTempToken] = React.useState('')

  console.log('SignIn component rendered'); // Debugging: Log when the component is rendered

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = data.get('email')
    const password = data.get('password')
    setLoading(true)
    setError('')
    try {
      const res = await login(email, password)
      
      // Check if 2FA is required
      if (res.requires2FA) {
        setUserEmail(email)
        setTempToken(res.tempToken)
        setShow2FA(true)
        setLoading(false)
        return
      }
      
      // Normal login flow
      if (res.token) {
        localStorage.setItem('token', res.token)
        localStorage.setItem('userRole', res.role) // Store the user role
        localStorage.setItem('user', JSON.stringify(res.user)) // Store user data
        console.log('User Role Stored:', res.role) // Debugging: Log the stored role
        navigate(`/${res.role}-dashboard`); // Dynamically navigate to the relevant dashboard
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handle2FASuccess = (userData) => {
    // Store user data and navigate to dashboard
    localStorage.setItem('userRole', userData.user.role)
    localStorage.setItem('user', JSON.stringify(userData.user))
    console.log('2FA Success - User Role:', userData.user.role)
    navigate(`/${userData.user.role}-dashboard`)
  }

  const handle2FABack = () => {
    setShow2FA(false)
    setUserEmail('')
    setTempToken('')
    setError('')
  }

  // If 2FA is required, show the verification component
  if (show2FA) {
    return (
      <TwoFactorVerificationSimple
        email={userEmail}
        tempToken={tempToken}
        onSuccess={handle2FASuccess}
        onBack={handle2FABack}
      />
    )
  }

  return (
    <BackgroundContainer>
      <CssBaseline />
      
      {/* Floating Background Icons */}
      <FloatingIcon><RocketLaunchIcon sx={{ fontSize: 120, color: 'white' }} /></FloatingIcon>
      <FloatingIcon><AutoAwesomeIcon sx={{ fontSize: 100, color: 'white' }} /></FloatingIcon>
      <FloatingIcon><TrendingUpIcon sx={{ fontSize: 140, color: 'white' }} /></FloatingIcon>
      <FloatingIcon><SecurityIcon sx={{ fontSize: 110, color: 'white' }} /></FloatingIcon>
      
      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <GlassPaper elevation={0}>
            <LogoContainer>
              <Box className="logo-icon">
                <RocketLaunchIcon sx={{ fontSize: 40 }} />
              </Box>
              <Typography 
                component="h1" 
                variant="h3" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  mb: 1
                }}
              >
                EventP AI
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(0,0,0,0.7)', 
                  textAlign: 'center',
                  fontWeight: 500,
                  mb: 3
                }}
              >
                Intelligent Event Management System
              </Typography>
            </LogoContainer>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <StyledTextField 
                margin="normal" 
                required 
                fullWidth 
                id="email" 
                label="Email Address" 
                name="email" 
                autoComplete="email" 
                autoFocus 
                sx={{ mb: 2 }}
              />
              <StyledTextField 
                margin="normal" 
                required 
                fullWidth 
                name="password" 
                label="Password" 
                type="password" 
                id="password" 
                autoComplete="current-password" 
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel 
                control={
                  <Checkbox 
                    value="remember" 
                    sx={{
                      color: 'rgba(102, 126, 234, 0.8)',
                      '&.Mui-checked': {
                        color: '#667eea',
                      },
                    }} 
                  />
                } 
                label={
                  <Typography sx={{ color: 'rgba(0,0,0,0.7)', fontWeight: 500 }}>
                    Remember me
                  </Typography>
                }
                sx={{ mb: 2 }}
              />
              
              {error && (
                <Box 
                  sx={{ 
                    background: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    borderRadius: 2,
                    p: 2,
                    mb: 2
                  }}
                >
                  <Typography color="error" variant="body2" sx={{ fontWeight: 500 }}>
                    {error}
                  </Typography>
                </Box>
              )}
              
              <AIButton 
                type="submit" 
                fullWidth 
                variant="contained" 
                disabled={loading}
                sx={{ mt: 2, mb: 3 }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 20, animation: 'spin 1s linear infinite' }} />
                    Authenticating...
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon sx={{ fontSize: 20 }} />
                    Sign In
                  </Box>
                )}
              </AIButton>
              
              <Box sx={{ textAlign: 'center' }}>
                <Link 
                  component={RouterLink} 
                  to="/register" 
                  sx={{
                    color: '#667eea',
                    fontWeight: 600,
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(102, 126, 234, 0.1)',
                      textDecoration: 'none',
                    }
                  }}
                >
                  Don't have an account? Join EventP AI →
                </Link>
              </Box>
            </Box>
          </GlassPaper>
          
          {/* Bottom tagline */}
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 4, 
              color: 'rgba(255,255,255,0.8)', 
              textAlign: 'center',
              fontWeight: 500,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Powered by AI • Trusted by thousands • Built for the future
          </Typography>
        </Box>
      </Container>
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </BackgroundContainer>
  )
}
