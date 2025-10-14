import React from 'react'
import { Box, Container, Typography, Button, Stack, Paper, Grid, Card, CardContent } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { AutoFixHigh, Edit, HealthAndSafety, Palette, PhotoLibrary, Download } from '@mui/icons-material'

export default function Home() {
  const features = [
    {
      icon: <AutoFixHigh sx={{ fontSize: '3rem', color: 'primary.main' }} />,
      title: 'AI-Powered Design',
      description: 'Generate stunning backgrounds from text descriptions using advanced AI'
    },
    {
      icon: <Palette sx={{ fontSize: '3rem', color: 'secondary.main' }} />,
      title: 'Creative Studio',
      description: 'Professional editing tools with drag-and-drop, layers, and effects'
    },
    {
      icon: <PhotoLibrary sx={{ fontSize: '3rem', color: 'primary.main' }} />,
      title: 'Artist Gallery',
      description: 'Access curated artist images and assets from cloud collections'
    },
    {
      icon: <Download sx={{ fontSize: '3rem', color: 'secondary.main' }} />,
      title: 'Multi-Format Export',
      description: 'Export for Instagram, Facebook, Twitter, and print in perfect quality'
    }
  ]

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))',
      minHeight: '100vh',
      py: 8
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography 
            variant="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 3
            }}
          >
            Event Poster AI Studio
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Create professional event posters in minutes with our AI-powered design workflow
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 6 }}>
            <Button
              component={RouterLink}
              to="/wizard"
              variant="contained"
              size="large"
              startIcon={<AutoFixHigh />}
              sx={{ 
                px: 4, 
                py: 2, 
                fontSize: '1.1rem',
                borderRadius: 4,
                background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                boxShadow: '0 8px 32px rgba(37,99,235,0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1d4ed8, #6d28d9)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(37,99,235,0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Start Creating with AI
            </Button>
            <Button
              component={RouterLink}
              to="/editor"
              variant="outlined"
              size="large"
              startIcon={<Edit />}
              sx={{ 
                px: 4, 
                py: 2, 
                fontSize: '1.1rem',
                borderRadius: 4,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Advanced Editor
            </Button>
          </Stack>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Process Preview */}
        <Paper elevation={3} sx={{ p: 6, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
            How It Works
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Typography variant="h4" color="white" fontWeight="bold">1</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>Describe Your Vision</Typography>
              <Typography variant="body2" color="text.secondary">
                Tell AI about your event style, mood, and atmosphere
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: 'linear-gradient(45deg, #7c3aed, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Typography variant="h4" color="white" fontWeight="bold">2</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>Creative Editing</Typography>
              <Typography variant="body2" color="text.secondary">
                Add artists, adjust layouts, and customize with professional tools
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Typography variant="h4" color="white" fontWeight="bold">3</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>AI Enhancement</Typography>
              <Typography variant="body2" color="text.secondary">
                Let AI optimize and harmonize your design for maximum impact
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Quick Links */}
        <Box textAlign="center" sx={{ mt: 6 }}>
          <Button
            component={RouterLink}
            to="/health"
            variant="text"
            startIcon={<HealthAndSafety />}
            sx={{ mr: 3 }}
          >
            System Health
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
