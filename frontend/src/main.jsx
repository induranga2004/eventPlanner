import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import MusicianDashboard from './components/MusicianDashboard'
import VenueDashboard from './components/VenueDashboard'
import UserDashboard from './components/UserDashboard'
const SignIn = React.lazy(() => import('./auth/SignIn.jsx'))
const RoleSelection = React.lazy(() => import('./auth/RoleSelection.jsx'))
const UserRegistration = React.lazy(() => import('./auth/UserRegistration.jsx'))
const MusicianRegistration = React.lazy(() => import('./auth/MusicianRegistration.jsx'))
const VenueRegistration = React.lazy(() => import('./auth/VenueRegistration.jsx'))
const Profile = React.lazy(() => import('./pages/Profile.jsx'))
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

const theme = createTheme()

const router = createBrowserRouter([
  { path: '/', element: <SignIn /> },
  { path: '/login', element: <SignIn /> },
  { path: '/register', element: <RoleSelection /> },
  { path: '/register/user', element: <UserRegistration /> },
  { path: '/register/musician', element: <MusicianRegistration /> },
  { path: '/register/venue', element: <VenueRegistration /> },
  { path: '/me', element: <Profile /> },
  { path: '/user-dashboard', element: <UserDashboard /> },
  { path: '/musician-dashboard', element: <MusicianDashboard /> },
  { path: '/venue-dashboard', element: <VenueDashboard /> },
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
      <ErrorBoundary>
        <React.Suspense fallback={<div>Loading...</div>}>
          <RouterProvider router={router} />
        </React.Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);
