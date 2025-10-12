import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import MusicianDashboard from './components/MusicianDashboard'
import MusicianProDashboard from './components/MusicianProDashboard'
import VenueDashboard from './components/VenueDashboard'
import UserDashboard from './components/UserDashboard'
import DashboardRouter from './components/DashboardRouter'
import MusicBandDashboard from './components/MusicBandDashboard'
import LightsDashboard from './components/LightsDashboard'
import SoundsDashboard from './components/SoundsDashboard'
import { SubscriptionProvider } from './hooks/useSubscription'
const SignIn = React.lazy(() => import('./auth/SignIn.jsx'))
const RoleSelection = React.lazy(() => import('./auth/RoleSelection.jsx'))
const UserRegistration = React.lazy(() => import('./auth/UserRegistration.jsx'))
const MusicianRegistration = React.lazy(() => import('./auth/MusicianRegistration.jsx'))
const MusicBandRegistration = React.lazy(() => import('./auth/MusicBandRegistration.jsx'))
const VenueRegistration = React.lazy(() => import('./auth/VenueRegistration.jsx'))
const LightsRegistration = React.lazy(() => import('./auth/LightsRegistration.jsx'))
const SoundsRegistration = React.lazy(() => import('./auth/SoundsRegistration.jsx'))
const Profile = React.lazy(() => import('./pages/Profile.jsx'))
const PaymentSuccess = React.lazy(() => import('./pages/PaymentSuccess.jsx'))
const PaymentCancel = React.lazy(() => import('./pages/PaymentCancel.jsx'))
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#f57c00',
      light: '#ffb74d',
      dark: '#e65100',
    },
    info: {
      main: '#0288d1',
      light: '#29b6f6',
      dark: '#01579b',
    },
    // role based palettes for dashboards
    roles: {
      musician: {
        main: '#7c4dff',
        gradient: 'linear-gradient(120deg, #8e7dff 0%, #5e35b1 100%)',
      },
      venue: {
        main: '#ff7043',
        gradient: 'linear-gradient(120deg, #ff8a65 0%, #d84315 100%)',
      },
      music_band: {
        main: '#6ee7b7',
        gradient: 'linear-gradient(120deg, #86efac 0%, #059669 100%)',
      },
      lights: {
        main: '#f59e0b',
        gradient: 'linear-gradient(120deg, #fbbf24 0%, #f97316 100%)',
      },
      sounds: {
        main: '#06b6d4',
        gradient: 'linear-gradient(120deg, #67e8f9 0%, #0891b2 100%)',
      },
      user: {
        main: '#3b82f6',
        gradient: 'linear-gradient(120deg, #60a5fa 0%, #1e40af 100%)',
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
})

const router = createBrowserRouter([
  { path: '/', element: <SignIn /> },
  { path: '/login', element: <SignIn /> },
  { path: '/register', element: <RoleSelection /> },
  { path: '/register/user', element: <UserRegistration /> },
  { path: '/register/musician', element: <MusicianRegistration /> },
  { path: '/register/music_band', element: <MusicBandRegistration /> },
  { path: '/register/venue', element: <VenueRegistration /> },
  { path: '/register/lights', element: <LightsRegistration /> },
  { path: '/register/sounds', element: <SoundsRegistration /> },
  { path: '/me', element: <Profile /> },
  { path: '/user-dashboard', element: <DashboardRouter /> },
  { path: '/musician-dashboard', element: <MusicianDashboard /> },
  { path: '/music_band-dashboard', element: <MusicBandDashboard /> },
  { path: '/venue-dashboard', element: <VenueDashboard /> },
  { path: '/lights-dashboard', element: <LightsDashboard /> },
  { path: '/sounds-dashboard', element: <SoundsDashboard /> },
  { path: '/payment/success', element: <PaymentSuccess /> },
  { path: '/payment/cancel', element: <PaymentCancel /> },
])

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole'); // Assuming role is stored in localStorage after login
    console.log('User Role:', userRole); // Debugging: Log the user role

    if (userRole) {
      navigate(`/${userRole}-dashboard`); // Dynamically navigate to the relevant dashboard
    } else {
      console.log('No role found, navigating to login'); // Debugging
      navigate('/login'); // Redirect to login if no role is found
    }
  }, [navigate]);

  return (
    <RouterProvider router={router} />
  );
};

export default App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SubscriptionProvider>
        <ErrorBoundary>
          <React.Suspense fallback={<div>Loading...</div>}>
            <RouterProvider router={router} />
          </React.Suspense>
        </ErrorBoundary>
      </SubscriptionProvider>
    </ThemeProvider>
  </React.StrictMode>
);
