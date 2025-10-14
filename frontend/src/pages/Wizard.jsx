import React, { useState, useCallback, useRef } from 'react'
import { 
  Container, Box, Typography, Button, TextField, Stack, Paper, 
  Stepper, Step, StepLabel, Grid, Card, CardMedia, CardContent,
  Fade, Slide, CircularProgress, Chip, IconButton, Fab
} from '@mui/material'
import { 
  AutoFixHigh, Refresh, Check, Edit, Download, 
  PhotoLibrary, Palette, TextFields, Tune
} from '@mui/icons-material'
import AppShell from '../components/AppShell'
import CanvasBoard from '../components/CanvasBoard'
import ArtistPicker from '../components/ArtistPicker'
import { IntelligenceAPI, DesignAPI } from '../services/designApi'
import { getFabric } from '../lib/fabricLoader'

const steps = ['Design Query', 'Select Background', 'Creative Editor', 'AI Optimize', 'Final Export']

const suggestedPrompts = [
  'Neon cyberpunk concert in Tokyo with purple and cyan lights',
  'Vintage jazz festival poster with Art Deco golden elements',
  'Summer beach party with tropical sunset and palm trees',
  'Electronic music event with geometric patterns and bold colors',
  'Classical symphony concert with elegant typography and marble textures'
]

export default function Wizard() {
  const [activeStep, setActiveStep] = useState(0)
  const [query, setQuery] = useState('')
  const [intelligence, setIntelligence] = useState(null)
  const [backgrounds, setBackgrounds] = useState([])
  const [selectedBg, setSelectedBg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [canvas, setCanvas] = useState(null)
  const [selectedArtists, setSelectedArtists] = useState([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [finalResult, setFinalResult] = useState(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showTextEditor, setShowTextEditor] = useState(false)
  const [textContent, setTextContent] = useState('Event Title')
  const [textColor, setTextColor] = useState('#ffffff')
  
  const canvasRef = useRef(null)

  const onCanvasReady = useCallback((c) => {
    setCanvas(c)
    canvasRef.current = c
  }, [])

  // Step 1: Generate backgrounds from query
  const generateBackgrounds = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      // Get AI intelligence first
      const intel = await IntelligenceAPI.analyze(query)
      setIntelligence(intel)
      
      // Generate multiple background variations
      const payload = {
        campaign_id: 'wizard-campaign',
        event: { 
          title: intel.event?.title || 'Event', 
          city: intel.location?.city || 'City', 
          date: '2025-12-31', 
          audience: 'general', 
          genre: intel.style?.genre || 'music'
        },
        artists: [{ id: 'temp', name: 'Placeholder', cutout_url: 'https://via.placeholder.com/400x600.png' }],
        style_prefs: { 
          mood: intel.style?.mood || 'minimal', 
          palette: intel.colors || ['#2563eb', '#7c3aed'], 
          sizes: ['square'] 
        }
      }
      
      // Generate 3 variations by calling start multiple times
      const variations = []
      for (let i = 0; i < 3; i++) {
        const result = await DesignAPI.start({ ...payload, campaign_id: `wizard-${i}` })
        variations.push(result)
      }
      
      setBackgrounds(variations)
      setActiveStep(1)
    } catch (error) {
      console.error('Background generation failed:', error)
    }
    setLoading(false)
  }

  // Step 2: Confirm background selection
  const confirmBackground = (bg) => {
    setSelectedBg(bg)
    loadBackgroundToCanvas(bg)
    setActiveStep(2)
  }

  const loadBackgroundToCanvas = async (bg) => {
    const bgUrl = bg?.variants?.[0]?.layers?.l1_background_url
    if (bgUrl && canvas) {
      const img = await new Promise((resolve) => {
        const el = new Image()
        el.crossOrigin = 'anonymous'
        el.onload = () => resolve(el)
        el.src = bgUrl
      })
      const fabric = await getFabric()
      const fabricImg = new fabric.Image(img, { left: 0, top: 0, selectable: false })
      const cw = typeof canvas.getWidth === 'function' ? canvas.getWidth() : (canvas.width || 0)
      const ch = typeof canvas.getHeight === 'function' ? canvas.getHeight() : (canvas.height || 0)
      const scale = Math.min(cw / img.width, ch / img.height)
      if (isFinite(scale) && scale > 0) {
        fabricImg.scale(scale)
      }
      canvas.setBackgroundImage(fabricImg, () => canvas.renderAll())
    }
  }

  // Step 3: Add artists and arrange elements with better positioning
  const addArtistsToCanvas = async (artists) => {
    if (!canvas || !artists.length) return
    
    const fabric = await getFabric()
    
    // Get canvas dimensions
    const canvasWidth = canvas.getWidth()
    const canvasHeight = canvas.getHeight()
    
    for (let i = 0; i < artists.length; i++) {
      const artist = artists[i]
      const img = await new Promise((resolve, reject) => {
        const el = new Image()
        el.crossOrigin = 'anonymous'
        el.onload = () => resolve(el)
        el.onerror = reject
        el.src = artist.raw || artist.view || artist.url
      }).catch(() => null)
      
      if (img) {
        // Better positioning logic - arrange in a more professional layout
        const totalArtists = selectedArtists.length + 1
        let x, y, scale
        
        if (totalArtists <= 3) {
          // Horizontal row for 1-3 artists
          x = (canvasWidth / (totalArtists + 1)) * (i + 1) - 100
          y = canvasHeight * 0.6
          scale = 0.4
        } else {
          // Grid layout for more artists
          const cols = Math.ceil(Math.sqrt(totalArtists))
          const col = i % cols
          const row = Math.floor(i / cols)
          x = (canvasWidth / (cols + 1)) * (col + 1) - 80
          y = canvasHeight * 0.5 + (row - 0.5) * 150
          scale = 0.3
        }
        
        const fabricImg = new fabric.Image(img, {
          left: x,
          top: y,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          cornerStyle: 'circle',
          cornerColor: '#2563eb',
          borderColor: '#2563eb',
          transparentCorners: false
        })
        
        canvas.add(fabricImg)
      }
    }
    canvas.renderAll()
    
    // Trigger refresh for any preview components
    setTimeout(() => {
      if (canvas) {
        canvas.renderAll()
      }
    }, 100)
  }

  // Add text to canvas
  const addTextToCanvas = async () => {
    if (!canvas) return
    
    const fabric = await getFabric()
    const text = new fabric.Text(textContent, {
      left: 100,
      top: 100,
      fontFamily: 'Inter',
      fontSize: 48,
      fontWeight: 'bold',
      fill: textColor,
      stroke: '#000000',
      strokeWidth: 2,
      shadow: 'rgba(0,0,0,0.5) 2px 2px 4px',
      selectable: true,
      hasControls: true,
      hasBorders: true
    })
    
    canvas.add(text)
    canvas.renderAll()
    setShowTextEditor(false)
  }

  // Apply color filter to canvas
  const applyColorEffect = async (filterType) => {
    if (!canvas) return
    
    const fabric = await getFabric()
    const objects = canvas.getObjects()
    
    objects.forEach(obj => {
      if (obj.type === 'image') {
        switch (filterType) {
          case 'sepia':
            obj.filters = [new fabric.Image.filters.Sepia()]
            break
          case 'grayscale':
            obj.filters = [new fabric.Image.filters.Grayscale()]
            break
          case 'brightness':
            obj.filters = [new fabric.Image.filters.Brightness({ brightness: 0.2 })]
            break
          default:
            obj.filters = []
        }
        obj.applyFilters()
      }
    })
    
    canvas.renderAll()
    setShowColorPicker(false)
  }

  // Step 4: AI Optimization (screenshot without text)
  const optimizeWithAI = async () => {
    if (!canvas) return
    
    setOptimizing(true)
    try {
      // Take canvas screenshot
      const dataURL = canvas.toDataURL('image/png')
      
      // Upload screenshot
      const uploadResult = await DesignAPI.uploadImage({
        image: dataURL,
        campaign_id: 'wizard-optimize',
        name: 'canvas_screenshot'
      })
      
      // Optimize text placement
      const optimization = await DesignAPI.optimizeText({
        bg_url: uploadResult.url,
        size: 'square'
      })
      
      // For demo, we'll just proceed - in reality, apply optimization results
      setActiveStep(4)
    } catch (error) {
      console.error('Optimization failed:', error)
    }
    setOptimizing(false)
  }

  // Step 5: Final harmonize and export - use canvas screenshot
  const generateFinal = async () => {
    if (!canvas) return
    
    setLoading(true)
    try {
      // Take canvas screenshot
      const dataURL = canvas.toDataURL('image/png')
      const uploadResult = await DesignAPI.uploadImage({
        image: dataURL,
        campaign_id: 'wizard-final',
        name: 'canvas_composition'
      })
      
      // Use harmonize with the canvas screenshot as both background and composition
      const payload = {
        render_id: selectedBg?.render_id || 'wizard',
        campaign_id: selectedBg?.campaign_id || 'wizard',
        size: 'square',
        bg_url: uploadResult.url, // Use canvas screenshot
        selected_cutouts: [], // Empty since we're harmonizing the whole composition
        seed_harmonize: Math.floor(Math.random() * 1000)
      }
      
      const result = await DesignAPI.harmonize(payload)
      setFinalResult(result)
    } catch (error) {
      console.error('Final generation failed:', error)
    }
    setLoading(false)
  }

  const downloadFinal = () => {
    if (finalResult?.l2_composite_url) {
      const link = document.createElement('a')
      link.href = finalResult.l2_composite_url
      link.download = 'event-poster.png'
      link.click()
    }
  }

  // Navigation functions with canvas refresh
  const goToNextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
      // Refresh canvas after navigation
      setTimeout(() => {
        if (canvas) {
          canvas.renderAll()
          // Re-apply background if moving to stages 3, 4, or 5
          if ((activeStep + 1) >= 2 && selectedBg && backgroundImages?.length > 0) {
            refreshCanvasBackground()
          }
        }
      }, 100)
    }
  }

  const goToPrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
      // Refresh canvas after navigation
      setTimeout(() => {
        if (canvas) {
          canvas.renderAll()
          // Re-apply background if moving to stages 3, 4, or 5
          if ((activeStep - 1) >= 2 && selectedBg && backgroundImages?.length > 0) {
            refreshCanvasBackground()
          }
        }
      }, 100)
    }
  }

  // Helper function to refresh canvas background
  const refreshCanvasBackground = async () => {
    if (!canvas || !selectedBg) return
    
    try {
      const fabric = await getFabric()
      const img = await new Promise((resolve, reject) => {
        const el = new Image()
        el.crossOrigin = 'anonymous'
        el.onload = () => resolve(el)
        el.onerror = reject
        el.src = selectedBg.url
      }).catch(() => null)
      
      if (img) {
        const fabricImg = new fabric.Image(img)
        const canvasWidth = canvas.getWidth()
        const canvasHeight = canvas.getHeight()
        const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height)
        
        if (isFinite(scale) && scale > 0) {
          fabricImg.scale(scale)
        }
        canvas.setBackgroundImage(fabricImg, () => canvas.renderAll())
      }
    } catch (error) {
      console.error('Failed to refresh canvas background:', error)
    }
  }

  return (
    <AppShell>
      <Box sx={{
        background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))',
        minHeight: '100vh'
      }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Progress Stepper */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel 
                  sx={{ 
                    '& .MuiStepIcon-root': { 
                      fontSize: '2rem',
                      '&.Mui-active': { color: 'primary.main' },
                      '&.Mui-completed': { color: 'success.main' }
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Step Content */}
        <Box sx={{ minHeight: '70vh' }}>
          
          {/* Step 1: Design Query */}
          {activeStep === 0 && (
            <Fade in timeout={600}>
              <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
                <Typography variant="h3" gutterBottom sx={{ 
                  fontWeight: 700, 
                  background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}>
                  Describe Your Event Vision
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                  Let AI create stunning backgrounds from your creative description
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe the mood, style, colors, and atmosphere of your event..."
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      background: 'rgba(255,255,255,0.05)'
                    }
                  }}
                />
                
                <Stack direction="row" spacing={1} sx={{ mb: 4, justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
                  {suggestedPrompts.map((prompt, idx) => (
                    <Chip
                      key={idx}
                      label={prompt}
                      variant="outlined"
                      clickable
                      onClick={() => setQuery(prompt)}
                      sx={{ borderRadius: 2 }}
                    />
                  ))}
                </Stack>
                
                <Button
                  variant="contained"
                  size="large"
                  onClick={generateBackgrounds}
                  disabled={!query.trim() || loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHigh />}
                  sx={{ 
                    borderRadius: 3, 
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    background: loading ? 'linear-gradient(45deg, #64748b, #94a3b8)' : 'linear-gradient(45deg, #2563eb, #7c3aed)',
                    '&:hover': {
                      background: loading ? 'linear-gradient(45deg, #64748b, #94a3b8)' : 'linear-gradient(45deg, #1d4ed8, #6d28d9)'
                    },
                    '&:disabled': {
                      background: 'linear-gradient(45deg, #64748b, #94a3b8)'
                    },
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': loading ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      animation: 'shimmer 2s infinite'
                    } : {}
                  }}
                >
                  {loading ? 'Generating Magic...' : 'Generate Backgrounds'}
                </Button>
                
                {loading && (
                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      AI is analyzing your vision and creating stunning backgrounds...
                    </Typography>
                    <Box sx={{ 
                      width: 300, 
                      height: 4, 
                      backgroundColor: '#e0e0e0', 
                      borderRadius: 2,
                      overflow: 'hidden',
                      mx: 'auto'
                    }}>
                      <Box sx={{
                        height: '100%',
                        background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                        borderRadius: 2,
                        animation: 'progress 3s ease-in-out infinite',
                        '@keyframes progress': {
                          '0%': { width: '0%' },
                          '50%': { width: '70%' },
                          '100%': { width: '90%' }
                        }
                      }} />
                    </Box>
                  </Box>
                )}
              </Box>
            </Fade>
          )}

          {/* Step 2: Background Selection */}
          {activeStep === 1 && (
            <Slide direction="up" in timeout={600}>
              <Box>
                <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 4 }}>
                  Choose Your Perfect Background
                </Typography>
                <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto' }}>
                  {backgrounds.map((bg, idx) => (
                    <Grid item xs={12} md={4} key={idx}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          borderRadius: 3,
                          '&:hover': { 
                            transform: 'translateY(-8px)', 
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)' 
                          }
                        }}
                        onClick={() => confirmBackground(bg)}
                      >
                        <CardMedia
                          component="img"
                          height="250"
                          image={bg.variants[0]?.layers?.l1_background_url}
                          alt={`Background ${idx + 1}`}
                          sx={{ borderRadius: '12px 12px 0 0' }}
                        />
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Style {idx + 1}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {bg.variants[0]?.meta?.mood || 'Creative'} • {bg.variants[0]?.meta?.model_bg || 'AI Generated'}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Check />}
                            sx={{ mt: 2, borderRadius: 2 }}
                            fullWidth
                          >
                            Select This Background
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Box textAlign="center" sx={{ mt: 4 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={generateBackgrounds}
                    sx={{ borderRadius: 3, mr: 2 }}
                  >
                    Generate More
                  </Button>
                </Box>
              </Box>
            </Slide>
          )}

          {/* Step 3: Creative Editor */}
          {activeStep === 2 && (
            <Fade in timeout={600}>
              <Box>
                <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 3 }}>
                  Creative Studio
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={8}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                      <CanvasBoard width={800} height={600} onReady={onCanvasReady} />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Stack spacing={2}>
                      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom startIcon={<PhotoLibrary />}>
                          Artist Elements
                        </Typography>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<PhotoLibrary />}
                          onClick={() => setPickerOpen(true)}
                          sx={{ borderRadius: 2, mb: 2 }}
                        >
                          Add One Artist
                        </Button>
                        {selectedArtists.length > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            {selectedArtists.length} artist(s) added to canvas
                          </Typography>
                        )}
                      </Paper>
                      
                      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Canvas Tools
                        </Typography>
                        <Stack spacing={1}>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<Palette />} 
                            sx={{ borderRadius: 2 }}
                            onClick={() => setShowColorPicker(!showColorPicker)}
                          >
                            Colors & Effects
                          </Button>
                          {showColorPicker && (
                            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                <Button size="small" onClick={() => applyColorEffect('sepia')}>Sepia</Button>
                                <Button size="small" onClick={() => applyColorEffect('grayscale')}>B&W</Button>
                                <Button size="small" onClick={() => applyColorEffect('brightness')}>Bright</Button>
                                <Button size="small" onClick={() => applyColorEffect('none')}>Reset</Button>
                              </Stack>
                            </Box>
                          )}
                          
                          <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<TextFields />} 
                            sx={{ borderRadius: 2 }}
                            onClick={() => setShowTextEditor(!showTextEditor)}
                          >
                            Add Text
                          </Button>
                          {showTextEditor && (
                            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                              <TextField
                                fullWidth
                                size="small"
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                placeholder="Enter text"
                                sx={{ mb: 1 }}
                              />
                              <Stack direction="row" spacing={1} alignItems="center">
                                <input
                                  type="color"
                                  value={textColor}
                                  onChange={(e) => setTextColor(e.target.value)}
                                  style={{ width: 30, height: 30, border: 'none', borderRadius: 4 }}
                                />
                                <Button size="small" variant="contained" onClick={addTextToCanvas}>
                                  Add to Canvas
                                </Button>
                              </Stack>
                            </Box>
                          )}
                          
                          <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<Tune />} 
                            sx={{ borderRadius: 2 }}
                            onClick={() => {
                              if (canvas) {
                                const objects = canvas.getObjects()
                                objects.forEach((obj, idx) => {
                                  obj.set({
                                    left: 100 + (idx % 3) * 200,
                                    top: 150 + Math.floor(idx / 3) * 200
                                  })
                                })
                                canvas.renderAll()
                              }
                            }}
                          >
                            Auto Layout
                          </Button>
                        </Stack>
                      </Paper>
                      
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => setActiveStep(3)}
                        sx={{ borderRadius: 3, py: 1.5 }}
                        startIcon={<AutoFixHigh />}
                      >
                        Optimize with AI
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
                
                <ArtistPicker 
                  open={pickerOpen} 
                  onClose={() => setPickerOpen(false)}
                  singleSelect={true}
                  onConfirm={(chosen) => { 
                    if (chosen.length > 0) {
                      setSelectedArtists(prev => [...prev, chosen[0]]);
                      addArtistsToCanvas(chosen);
                    }
                    setPickerOpen(false);
                  }} 
                />
              </Box>
            </Fade>
          )}

          {/* Step 4: AI Optimization */}
          {activeStep === 3 && (
            <Fade in timeout={600}>
              <Box>
                <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 3 }}>
                  AI Optimization Preview
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={8}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                      <Typography variant="h6" gutterBottom>Current Composition</Typography>
                      <CanvasBoard width={800} height={600} onReady={(c) => {
                        // Load background and existing elements to this canvas too
                        if (selectedBg) {
                          setTimeout(() => loadBackgroundToCanvas(selectedBg), 100)
                        }
                      }} />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} lg={4}>
                    <Box sx={{ 
                      background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))',
                      borderRadius: 4,
                      p: 4,
                      textAlign: 'center'
                    }}>
                      {optimizing ? (
                        <>
                          <CircularProgress size={60} sx={{ mb: 3, color: 'primary.main' }} />
                          <Typography variant="h6" gutterBottom>
                            AI is Optimizing
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Analyzing composition and enhancing visual impact...
                          </Typography>
                        </>
                      ) : (
                        <>
                          <AutoFixHigh sx={{ fontSize: '4rem', color: 'primary.main', mb: 2 }} />
                          <Typography variant="h6" gutterBottom>
                            Ready for Enhancement
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            AI will analyze your composition and optimize it for maximum impact.
                          </Typography>
                          <Button
                            variant="contained"
                            size="large"
                            onClick={optimizeWithAI}
                            sx={{ 
                              borderRadius: 3, 
                              px: 4, 
                              py: 1.5,
                              background: 'linear-gradient(45deg, #2563eb, #7c3aed)'
                            }}
                            startIcon={<AutoFixHigh />}
                          >
                            Optimize Now
                          </Button>
                        </>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          {/* Step 5: Final Export */}
          {activeStep === 4 && (
            <Fade in timeout={600}>
              <Box textAlign="center">
                <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                  Your Masterpiece is Ready!
                </Typography>
                
                <Grid container spacing={4} sx={{ maxWidth: 1000, mx: 'auto' }}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                      <Typography variant="h6" gutterBottom>Current Canvas</Typography>
                      <Box sx={{ width: 400, height: 300, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                        {canvas ? (
                          <img 
                            src={canvas.toDataURL('image/png')} 
                            alt="Current Canvas"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            key={Date.now()} // Force refresh
                          />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Typography color="text.secondary">Canvas loading...</Typography>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    {finalResult ? (
                      <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>AI-Enhanced Final</Typography>
                        <Box
                          component="img"
                          src={finalResult.l2_composite_url}
                          alt="Final Result"
                          sx={{ 
                            width: '100%', 
                            height: 300, 
                            objectFit: 'cover', 
                            borderRadius: 2,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                          }}
                        />
                      </Paper>
                    ) : (
                      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>Generate Final Version</Typography>
                        <Button
                          variant="contained"
                          size="large"
                          onClick={generateFinal}
                          disabled={loading}
                          sx={{ borderRadius: 3, px: 4 }}
                          startIcon={loading ? <CircularProgress size={20} /> : <AutoFixHigh />}
                        >
                          {loading ? 'Creating...' : 'Generate Final'}
                        </Button>
                      </Paper>
                    )}
                  </Grid>
                </Grid>
                
                {finalResult && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>Export Options</Typography>
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<Download />}
                        onClick={downloadFinal}
                        sx={{ borderRadius: 3, px: 4 }}
                      >
                        Download PNG
                      </Button>
                      <Button variant="outlined" size="large" sx={{ borderRadius: 3, px: 4 }}>
                        Share on Social
                      </Button>
                      <Button variant="outlined" size="large" sx={{ borderRadius: 3, px: 4 }}>
                        Create Variations
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Box>
            </Fade>
          )}

        </Box>

        {/* Navigation Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={goToPrevStep}
            disabled={activeStep === 0}
            sx={{ borderRadius: 3, px: 4 }}
          >
            Previous
          </Button>
          
          <Button
            variant="contained"
            onClick={goToNextStep}
            disabled={activeStep === steps.length - 1}
            sx={{ borderRadius: 3, px: 4 }}
          >
            Next
          </Button>
        </Box>
      </Container>
      </Box>
    </AppShell>
  )
}