import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import App from './App.jsx'
const SignIn = React.lazy(() => import('./auth/SignIn.jsx'))
const SignUp = React.lazy(() => import('./auth/SignUp.jsx'))
const Profile = React.lazy(() => import('./pages/Profile.jsx'))

const theme = createTheme()

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/planner', element: <App /> },
  { path: '/login', element: <SignIn /> },
  { path: '/register', element: <SignUp /> },
  { path: '/me', element: <Profile /> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <React.Suspense fallback={null}>
        <RouterProvider router={router} />
      </React.Suspense>
    </ThemeProvider>
  </React.StrictMode>
)
