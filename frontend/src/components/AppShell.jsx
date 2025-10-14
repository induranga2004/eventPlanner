import React from 'react'
import { AppBar, Toolbar, Typography, Box, Button, Stack } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function AppShell({ children }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Event Planner AI
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button color="inherit" component={RouterLink} to="/">Home</Button>
            <Button color="inherit" component={RouterLink} to="/editor">Editor</Button>
            <Button color="inherit" component={RouterLink} to="/health">Health</Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  )}
