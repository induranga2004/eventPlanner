import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
const SignIn = React.lazy(() => import('./auth/SignIn.jsx'))
const SignUp = React.lazy(() => import('./auth/SignUp.jsx'))
const Profile = React.lazy(() => import('./pages/Profile.jsx'))
const AdvancedDesignEditor = React.lazy(() => import('./components/AdvancedCanvas/AdvancedDesignEditor.jsx'))

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
})

const router = createBrowserRouter([
  { path: '/', element: <SignIn /> },
  { path: '/login', element: <SignIn /> },
  { path: '/register', element: <SignUp /> },
  { path: '/me', element: <Profile /> },
  { path: '/editor', element: <AdvancedDesignEditor /> },
  { path: '/design', element: <AdvancedDesignEditor /> },
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
