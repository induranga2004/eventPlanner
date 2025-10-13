import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
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
const ForgotPassword = React.lazy(() => import('./auth/ForgotPassword.jsx'))
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import theme from './theme';

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
  { path: '/forgot-password', element: <ForgotPassword /> },
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

  return <RouterProvider router={router} />;
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
