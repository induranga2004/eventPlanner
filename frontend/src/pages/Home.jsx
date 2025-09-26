import React from 'react'
import { Box, Container, Typography, Button, Stack } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={3} alignItems="center">
        <Typography variant="h4">Event Planner AI — Frontend (Clean)</Typography>
        <Typography color="text.secondary" align="center">
          Minimal UI to test the backend intelligence and design APIs.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" component={RouterLink} to="/editor">
            Open Editor
          </Button>
          <Button variant="outlined" component={RouterLink} to="/health">
            Backend Health
          </Button>
        </Stack>
      </Stack>
    </Container>
  )
}
