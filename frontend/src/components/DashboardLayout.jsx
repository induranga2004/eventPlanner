import * as React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import CssBaseline from '@mui/material/CssBaseline'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import { styled, keyframes } from '@mui/material/styles'
import DashboardIcon from '@mui/icons-material/Dashboard'
import { useNavigate } from 'react-router-dom'

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

const pulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`

// AI-themed dashboard styled components
const AIBackgroundContainer = styled(Box)(({ theme, role }) => {
  const roleGradients = {
    'user': 'linear-gradient(-45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
    'musician': 'linear-gradient(-45deg, #1e3c72 0%, #2a5298 25%, #8e44ad 50%, #c0392b 75%, #27ae60 100%)', 
    'venue': 'linear-gradient(-45deg, #16a085 0%, #f39c12 25%, #27ae60 50%, #e67e22 75%, #2ecc71 100%)',
    'lights': 'linear-gradient(-45deg, #e74c3c 0%, #f39c12 25%, #e67e22 50%, #d35400 75%, #c0392b 100%)',
    'musicband': 'linear-gradient(-45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #667eea 75%, #764ba2 100%)',
    'sounds': 'linear-gradient(-45deg, #4facfe 0%, #00f2fe 25%, #4facfe 50%, #00f2fe 75%, #4facfe 100%)',
    'default': 'linear-gradient(-45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)'
  }
  
  return {
    minHeight: '100vh',
    background: roleGradients[role] || roleGradients.default,
    backgroundSize: '400% 400%',
    animation: `${gradientShift} 8s ease infinite`,
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      backdropFilter: 'blur(10px)',
      zIndex: 0,
    }
  }
})

const GlassDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0 20px 20px 0',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      zIndex: -1,
    }
  }
}))

const FloatingIcon = styled(Box)(({ theme }) => ({
  animation: `${float} 3s ease-in-out infinite`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.3)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px) scale(1.05)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  }
}))

const AIAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: 'none',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}))

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 700,
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
}))

const AINavButton = styled(ListItemButton)(({ theme }) => ({
  margin: '8px 16px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateX(5px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
  '& .MuiListItemText-primary': {
    color: '#fff',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  }
}))

const AIButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
  color: '#fff',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(255,100,100,0.3) 0%, rgba(255,100,100,0.2) 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
  }
}))

const PulseBox = styled(Box)(({ theme }) => ({
  animation: `${pulse} 2s ease-in-out infinite`,
  background: 'rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(10px)',
}))

const drawerWidth = 260

export default function DashboardLayout({ title = 'Dashboard', navItems = [], children, role = 'user' }) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const navigate = useNavigate()

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState)
  }

  const drawer = (
    <div>
      <Toolbar />
      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{
          height: 64,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 2,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          color: '#fff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          transform: 'translateY(0)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          }
        }}>
          <FloatingIcon sx={{ width: 40, height: 40 }}>
            <DashboardIcon sx={{ color: '#fff', fontSize: 20 }} />
          </FloatingIcon>
          <GradientText variant="subtitle1">{title}</GradientText>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      <List sx={{ px: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <AINavButton 
              fullWidth
              onClick={() => item.to && navigate(item.to)}
            >
              <ListItemText primary={item.label} />
            </AINavButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 2 }} />
      <Box p={2}>
        <AIButton 
          fullWidth 
          onClick={() => {
            localStorage.removeItem('token')
            localStorage.removeItem('userRole')
            navigate('/login')
          }}
        >
          Logout
        </AIButton>
      </Box>
    </div>
  )

  return (
    <AIBackgroundContainer role={role} sx={{ display: 'flex' }}>
      <CssBaseline />
      <AIAppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: '#fff',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box display="flex" alignItems="center" gap={2}>
            <FloatingIcon sx={{ width: 32, height: 32 }}>
              <DashboardIcon sx={{ color: '#fff', fontSize: 18 }} />
            </FloatingIcon>
            <GradientText variant="h6" noWrap component="div">
              {title}
            </GradientText>
          </Box>
        </Toolbar>
      </AIAppBar>
      
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="navigation">
        <GlassDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </GlassDrawer>
        <GlassDrawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
          open
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            {drawer}
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 500,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                Made with ♥ by AI
              </Typography>
            </Box>
          </Box>
        </GlassDrawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Toolbar />
        <Box sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          minHeight: 'calc(100vh - 120px)',
          p: { xs: 2, sm: 3 },
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}>
          {children}
        </Box>
      </Box>
    </AIBackgroundContainer>
  )
}


