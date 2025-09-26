import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

const Home = React.lazy(() => import('./pages/Home.jsx'))
const Editor = React.lazy(() => import('./pages/Editor.jsx'))
const Health = React.lazy(() => import('./pages/Health.jsx'))
const Wizard = React.lazy(() => import('./pages/Wizard.jsx'))

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' }, // Clean blue
    secondary: { main: '#7c3aed' }, // Simple purple
    background: {
      default: '#fafafa',
      paper: '#ffffff'
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666'
    }
  },
  typography: { 
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em'
    },
    h6: {
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }
      }
    }
  }
})

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/editor', element: <Editor /> },
  { path: '/wizard', element: <Wizard /> },
  { path: '/health', element: <Health /> },
  { path: '/design', element: <Editor /> },
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
