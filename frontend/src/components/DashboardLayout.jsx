import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const MotionBox = motion.create(Box);

// Color Hunt palette styled components
const BackgroundContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1F316F 0%, #1A4870 50%, #1F316F 100%)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at top right, rgba(91, 153, 194, 0.1) 0%, transparent 50%)',
    pointerEvents: 'none',
  }
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    background: 'linear-gradient(180deg, #1A4870 0%, #1F316F 100%)',
    border: 'none',
    borderRight: '1px solid rgba(91, 153, 194, 0.2)',
  }
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(90deg, #1F316F 0%, #1A4870 100%)',
  border: 'none',
  borderBottom: '1px solid rgba(91, 153, 194, 0.2)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
}));

const NavButton = styled(ListItemButton)(({ theme }) => ({
  margin: '8px 16px',
  borderRadius: '12px',
  background: 'rgba(91, 153, 194, 0.1)',
  border: '1px solid rgba(91, 153, 194, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(91, 153, 194, 0.2)',
    transform: 'translateX(5px)',
    borderColor: 'rgba(91, 153, 194, 0.4)',
  },
  '& .MuiListItemText-primary': {
    color: '#F9DBBA',
    fontWeight: 600,
  }
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(91, 153, 194, 0.2) 0%, rgba(91, 153, 194, 0.1) 100%)',
  color: '#F9DBBA',
  border: '1px solid rgba(91, 153, 194, 0.3)',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(220, 38, 38, 0.2) 100%)',
    borderColor: 'rgba(220, 38, 38, 0.5)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
  }
}));

const drawerWidth = 260;

export default function DashboardLayout({ title = 'Dashboard', navItems = [], children, role = 'user' }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <div>
      <Toolbar />
      <Box sx={{ px: 2, py: 2 }}>
        <MotionBox
          whileHover={{ y: -2, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          sx={{
            height: 64,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2,
            background: 'linear-gradient(135deg, rgba(91, 153, 194, 0.2) 0%, rgba(91, 153, 194, 0.1) 100%)',
            border: '1px solid rgba(91, 153, 194, 0.3)',
            color: '#F9DBBA',
            cursor: 'pointer',
          }}
        >
          <MotionBox
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(91, 153, 194, 0.3) 0%, rgba(91, 153, 194, 0.15) 100%)',
              border: '1px solid rgba(91, 153, 194, 0.4)',
            }}
          >
            <DashboardIcon sx={{ color: '#F9DBBA', fontSize: 20 }} />
          </MotionBox>
          <Typography variant="subtitle1" sx={{ color: '#F9DBBA', fontWeight: 700 }}>
            {title}
          </Typography>
        </MotionBox>
      </Box>
      <Divider sx={{ borderColor: 'rgba(91, 153, 194, 0.2)' }} />
      <List sx={{ px: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <NavButton 
              fullWidth
              onClick={() => item.to && navigate(item.to)}
            >
              <ListItemText primary={item.label} />
            </NavButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(91, 153, 194, 0.2)', my: 2 }} />
      <Box p={2}>
        <LogoutButton 
          fullWidth 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            navigate('/login');
          }}
        >
          Logout
        </LogoutButton>
      </Box>
    </div>
  );

  return (
    <BackgroundContainer sx={{ display: 'flex' }}>
      <CssBaseline />
      <StyledAppBar
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
              color: '#F9DBBA',
              '&:hover': {
                background: 'rgba(91, 153, 194, 0.2)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box display="flex" alignItems="center" gap={2}>
            <MotionBox
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(91, 153, 194, 0.3) 0%, rgba(91, 153, 194, 0.15) 100%)',
                border: '1px solid rgba(91, 153, 194, 0.4)',
              }}
            >
              <DashboardIcon sx={{ color: '#F9DBBA', fontSize: 18 }} />
            </MotionBox>
            <Typography variant="h6" noWrap component="div" sx={{ color: '#F9DBBA', fontWeight: 700 }}>
              {title}
            </Typography>
          </Box>
        </Toolbar>
      </StyledAppBar>
      
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="navigation">
        <StyledDrawer
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
        </StyledDrawer>
        <StyledDrawer
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
                  color: 'rgba(249, 219, 186, 0.7)',
                  fontWeight: 500,
                }}
              >
                Event Planner Studio
              </Typography>
            </Box>
          </Box>
        </StyledDrawer>
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
          background: 'linear-gradient(135deg, rgba(26, 72, 112, 0.5) 0%, rgba(31, 49, 111, 0.3) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(91, 153, 194, 0.2)',
          minHeight: 'calc(100vh - 120px)',
          p: { xs: 2, sm: 3 },
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        }}>
          {children}
        </Box>
      </Box>
    </BackgroundContainer>
  );
}


