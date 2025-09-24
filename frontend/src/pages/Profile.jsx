import * as React from 'react'
import { me } from "../api/auth";
import { useNavigate } from 'react-router-dom'
import { Container, CssBaseline, Box, Typography, Button } from '@mui/material'

export default function Profile() {
  const [user, setUser] = React.useState(null)
  const [error, setError] = React.useState('')
  const navigate = useNavigate()

  React.useEffect(() => {
    async function load() {
      try {
        const data = await me()
        setUser(data.user)
      } catch (e) {
        setError('Unauthorized, please sign in')
      }
    }
    load()
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {user ? (
          <Box>
            <Typography>ID: {user.id}</Typography>
            <Typography>Email: {user.email}</Typography>
          </Box>
        ) : (
          !error && <Typography>Loading…</Typography>
        )}
        <Button onClick={logout} sx={{ mt: 3 }} variant="outlined">
          Logout
        </Button>
      </Box>
    </Container>
  )
}
