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
import { useNavigate } from 'react-router-dom'
import { styled } from '@mui/material/styles'

const drawerWidth = 260

const PulseBox = styled(Box)`
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(1); opacity: 0.8; }
  }
  animation: pulse 2.6s infinite;
`

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
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 1,
          background: (theme) => (theme.palette.roles?.[role]?.gradient || theme.palette.primary.main),
          color: '#fff',
          boxShadow: (theme) => '0 6px 18px rgba(0,0,0,0.08)',
          transform: 'translateY(0)',
          transition: 'transform 320ms ease',
        }}>
          <PulseBox sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: 18, height: 18, borderRadius: 0.5, bgcolor: 'white' }} />
          </PulseBox>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => item.to && navigate(item.to)}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box p={2}>
        <Button fullWidth variant="outlined" color="error" onClick={() => {
          localStorage.removeItem('token')
          localStorage.removeItem('userRole')
          navigate('/login')
        }}>Logout</Button>
      </Box>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        color="inherit"
        elevation={1}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: 'primary.main' }} />
            <Typography variant="h6" noWrap component="div">
              {title}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="mailbox folders">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: (theme) => theme.palette.mode === 'light' ? '#fff' : theme.palette.background.paper },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            {drawer}
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">Made with ♥</Typography>
            </Box>
          </Box>
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: (theme) => theme.palette.mode === 'light' ? '#f7f8fb' : 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}


