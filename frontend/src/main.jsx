import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

const Home = React.lazy(() => import('./pages/Home.jsx'))
const Editor = React.lazy(() => import('./pages/Editor.jsx'))
const Health = React.lazy(() => import('./pages/Health.jsx'))

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#6a1b9a' },
  },
  typography: { fontFamily: 'Inter, system-ui, sans-serif' },
})

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/editor', element: <Editor /> },
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
