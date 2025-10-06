import * as React from 'react'
import { me } from "../api/auth";
import { useNavigate } from 'react-router-dom'
import { Container, CssBaseline, Box, Typography, Button, Avatar } from '@mui/material'
import { styled, keyframes } from '@mui/material/styles'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'

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

// AI-themed profile styled components
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
  textAlign: 'center',
}))

const FloatingAvatar = styled(Avatar)(() => ({
  animation: `${float} 4s ease-in-out infinite`,
  width: '120px',
  height: '120px',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
  border: '3px solid rgba(255,255,255,0.3)',
  backdropFilter: 'blur(10px)',
  margin: '0 auto 20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  }
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

const AIButton = styled(Button)(() => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
  color: '#fff',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  fontWeight: 600,
  textTransform: 'none',
  padding: '12px 24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.3) 0%, rgba(244, 67, 54, 0.2) 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
  },
}))

const InfoBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '16px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  margin: '16px 0',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
  }
}))

export default function Profile() {
  const [user, setUser] = React.useState(null)
  const [error, setError] = React.useState('')
  const navigate = useNavigate()

  React.useEffect(() => {
    async function load() {
      try {
        const data = await me()
        setUser(data.user)
      } catch (e) {
        setError('Unauthorized, please sign in')
        navigate('/login') // Redirect to login if unauthorized
      }
    }
    load()
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <BackgroundContainer>
      <CssBaseline />
      <GlassPaper>
        <FloatingAvatar>
          <PersonIcon sx={{ fontSize: 60, color: '#fff' }} />
        </FloatingAvatar>
        
        <GradientText variant="h4">
          Profile
        </GradientText>
        
        {error && (
          <Typography 
            sx={{ 
              mb: 3, 
              p: 2, 
              background: 'rgba(244, 67, 54, 0.1)', 
              border: '1px solid rgba(244, 67, 54, 0.3)',
              borderRadius: '8px',
              color: '#fff',
              backdropFilter: 'blur(10px)',
            }}
          >
            {error}
          </Typography>
        )}
        
        {user ? (
          <Box>
            <InfoBox>
              <PersonIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                ID: {user.id}
              </Typography>
            </InfoBox>
            
            <InfoBox>
              <EmailIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                Email: {user.email}
              </Typography>
            </InfoBox>
            
            <AIButton 
              onClick={logout} 
              sx={{ mt: 4 }}
              startIcon={<ExitToAppIcon />}
            >
              Logout
            </AIButton>
          </Box>
        ) : (
          !error && (
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>
              Loading…
            </Typography>
          )
        )}
      </GlassPaper>
    </BackgroundContainer>
  )
}
