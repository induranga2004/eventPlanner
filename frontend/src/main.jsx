import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import MusicianDashboard from './components/MusicianDashboard'
import MusicianProDashboard from './components/MusicianProDashboard'
import VenueDashboard from './components/VenueDashboard'
import DashboardRouter from './components/DashboardRouter'
import MusicBandDashboard from './components/MusicBandDashboard'
import LightsDashboard from './components/LightsDashboard'
import SoundsDashboard from './components/SoundsDashboard'
import { SubscriptionProvider } from './hooks/useSubscription'
import { EventPlanningProvider } from './contexts/EventPlanningContext'
import ErrorBoundary from './components/ErrorBoundary'
import theme from './theme'

const PlannerApp = React.lazy(() => import('./App.jsx'))
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

// AI Visual Composer pages from feature branch
const Home = React.lazy(() => import('./pages/Home.jsx'))
const Editor = React.lazy(() => import('./pages/Editor.jsx'))
const Health = React.lazy(() => import('./pages/Health.jsx'))
const Wizard = React.lazy(() => import('./pages/Wizard.jsx'))
const AIPosterWizard = React.lazy(() => import('./pages/AIPosterWizard.jsx'))

// Social Sharing page
const AutoShare = React.lazy(() => import('./pages/AutoShare.jsx'))

const RootRedirect = () => {
  const navigate = useNavigate()

  React.useEffect(() => {
    const userRole = localStorage.getItem('userRole')

    if (userRole) {
      navigate(`/${userRole}-dashboard`, { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  return null
}

const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: '/planner', element: <PlannerApp /> },
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
  { path: '/musician-pro-dashboard', element: <MusicianProDashboard /> },
  { path: '/music_band-dashboard', element: <MusicBandDashboard /> },
  { path: '/venue-dashboard', element: <VenueDashboard /> },
  { path: '/lights-dashboard', element: <LightsDashboard /> },
  { path: '/sounds-dashboard', element: <SoundsDashboard /> },
  { path: '/payment/success', element: <PaymentSuccess /> },
  { path: '/payment/cancel', element: <PaymentCancel /> },
  // AI Visual Composer routes
  { path: '/home', element: <Home /> },
  { path: '/editor', element: <Editor /> },
  { path: '/wizard', element: <Wizard /> },
  { path: '/ai-poster-wizard', element: <AIPosterWizard /> },
  { path: '/health', element: <Health /> },
  { path: '/design', element: <Editor /> },
  // Social Sharing route
  { path: '/auto-share', element: <AutoShare /> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SubscriptionProvider>
        <EventPlanningProvider>
          <ErrorBoundary>
            <React.Suspense fallback={<div>Loading...</div>}>
              <RouterProvider router={router} />
            </React.Suspense>
          </ErrorBoundary>
        </EventPlanningProvider>
      </SubscriptionProvider>
    </ThemeProvider>
  </React.StrictMode>
)
