// frontend/src/pages/AIPosterWizard.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  AutoAwesome,
  Brush,
  ColorLens,
  Download,
  EventNote,
  Close,
  ArrowBack,
  ArrowForward,
  Refresh,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useEventPlanning } from '../contexts/EventPlanningContext';
import { mapEventContextToAIPayload, generateSmartQuery } from '../utils/eventToAIMapper';
import { buildPlannerApiUrl } from '../config/api.js';
import { withPlannerKey } from '../api/plannerHeaders.js';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const steps = [
  'Event Context',
  'Generate Backgrounds',
  'Harmonize Design',
  'Download',
];

export default function AIPosterWizard() {
  const { eventData, loadEventData } = useEventPlanning();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Design state
  const [campaignId, setCampaignId] = useState(null);
  const [backgrounds, setBackgrounds] = useState([]);
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [harmonizedImages, setHarmonizedImages] = useState([]);
  const [musicians, setMusicians] = useState([]);
  const [customQuery, setCustomQuery] = useState('');
  const [autoLoaded, setAutoLoaded] = useState(false);

  // Auto-load event context on mount
  useEffect(() => {
    const loadContext = async () => {
      try {
        const context = await loadEventData();
        if (context) {
          setAutoLoaded(true);
          // Generate smart query from event data
          const smartQuery = generateSmartQuery(context);
          setCustomQuery(smartQuery);
          setSuccess(`✅ Loaded event: ${context.event_name || 'Unnamed Event'}`);
          
          // Auto-advance to background generation step
          setTimeout(() => {
            setActiveStep(1);
          }, 1500);
        } else {
          setError('No event context found. Please complete event planning first.');
        }
      } catch (err) {
        console.error('Failed to load event context:', err);
        setError('Failed to load event data');
      }
    };
    
    loadContext();
  }, []);

  // Start design with event context
  const handleStartDesign = async () => {
    if (!eventData) {
      setError('No event data available. Please select a concept first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = mapEventContextToAIPayload(eventData);
      
      const response = await fetch(buildPlannerApiUrl('/design/start-from-event'), {
        method: 'POST',
        headers: withPlannerKey({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setCampaignId(data.campaign_id);
      setSuccess('✨ Design campaign created! Generating backgrounds...');
      
      // Auto-generate backgrounds
      setTimeout(() => {
        handleGenerateBackgrounds(data.campaign_id);
      }, 1000);
      
    } catch (err) {
      console.error('Start design error:', err);
      setError(`Failed to start design: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate backgrounds
  const handleGenerateBackgrounds = async (cid = campaignId) => {
    if (!cid) {
      setError('No campaign ID. Please start design first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildPlannerApiUrl('/design/generate-backgrounds'), {
        method: 'POST',
        headers: withPlannerKey({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          campaign_id: cid,
          user_query: customQuery || generateSmartQuery(eventData),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setBackgrounds(data.bg_options || []);
      setSuccess(`🎨 Generated ${data.bg_options?.length || 0} backgrounds!`);
      setActiveStep(2);
      
    } catch (err) {
      console.error('Generate backgrounds error:', err);
      setError(`Failed to generate backgrounds: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Harmonize design
  const handleHarmonize = async () => {
    if (!campaignId || !selectedBackground) {
      setError('Please select a background first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Extract musicians from event data
      const musicProviders = eventData?.selections?.music || [];
      const musicianPhotos = musicProviders
        .map(p => p.photo)
        .filter(Boolean);

      const response = await fetch(buildPlannerApiUrl('/design/harmonize'), {
        method: 'POST',
        headers: withPlannerKey({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          campaign_id: campaignId,
          bg_choice_idx: selectedBackground,
          musician_image_urls: musicianPhotos,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setHarmonizedImages(data.harmonized_images || []);
      setSuccess('✨ Harmonization complete!');
      setActiveStep(3);
      
    } catch (err) {
      console.error('Harmonize error:', err);
      setError(`Failed to harmonize: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Download image
  const handleDownload = (imageUrl, index) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${eventData?.event_name || 'poster'}_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccess(`✅ Downloaded poster ${index + 1}`);
  };

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(249, 219, 186, 0.2)',
                borderRadius: '16px',
                p: 4,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <EventNote sx={{ fontSize: '2rem', color: '#5B99C2', mr: 2 }} />
                  <Typography variant="h5" sx={{ color: '#F9DBBA', fontWeight: 700 }}>
                    Event Context
                  </Typography>
                </Box>

                {autoLoaded && eventData ? (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#5B99C2', mb: 0.5 }}>
                        Event Name
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#F9DBBA' }}>
                        {eventData.event_name || 'Unnamed Event'}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#5B99C2', mb: 0.5 }}>
                        Venue
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#F9DBBA' }}>
                        {eventData.venue || 'TBD'}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#5B99C2', mb: 0.5 }}>
                        Date
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#F9DBBA' }}>
                        {eventData.event_date || 'TBD'}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#5B99C2', mb: 0.5 }}>
                        Budget
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#F9DBBA' }}>
                        LKR {eventData.total_budget_lkr?.toLocaleString() || '0'}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ color: '#5B99C2', mb: 0.5 }}>
                        Concept
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#F9DBBA' }}>
                        {eventData.selectedConcept?.title || 'N/A'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(249, 219, 186, 0.7)' }}>
                        {eventData.selectedConcept?.tagline || ''}
                      </Typography>
                    </Box>

                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Custom Query (Optional)"
                      value={customQuery}
                      onChange={(e) => setCustomQuery(e.target.value)}
                      placeholder="Describe your desired poster style..."
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          color: '#F9DBBA',
                          '& fieldset': { borderColor: 'rgba(91, 153, 194, 0.5)' },
                          '&:hover fieldset': { borderColor: '#5B99C2' },
                          '&.Mui-focused fieldset': { borderColor: '#5B99C2' },
                        },
                        '& .MuiInputLabel-root': { color: '#5B99C2' },
                      }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleStartDesign}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
                      sx={{
                        background: 'linear-gradient(135deg, #5B99C2 0%, #1A4870 100%)',
                        color: '#F9DBBA',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        py: 1.5,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7FB3D5 0%, #1F316F 100%)',
                        },
                      }}
                    >
                      {loading ? 'Starting...' : 'Start Generating'}
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: '#5B99C2', mb: 2 }} />
                    <Typography sx={{ color: 'rgba(249, 219, 186, 0.7)' }}>
                      Loading event data...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </MotionBox>
        );

      case 1:
        return (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#F9DBBA', fontWeight: 700, mb: 1 }}>
                Background Generation
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(249, 219, 186, 0.7)' }}>
                AI-generated backgrounds tailored to your event
              </Typography>
            </Box>

            {backgrounds.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CircularProgress sx={{ color: '#5B99C2', mb: 2 }} size={60} />
                <Typography sx={{ color: '#F9DBBA', fontSize: '1.1rem' }}>
                  Generating stunning backgrounds...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
                {backgrounds.map((bg, idx) => (
                  <MotionCard
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    sx={{
                      position: 'relative',
                      cursor: 'pointer',
                      border: selectedBackground === idx ? '3px solid #5B99C2' : '1px solid rgba(249, 219, 186, 0.2)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0px 12px 32px rgba(91, 153, 194, 0.4)',
                      },
                    }}
                    onClick={() => setSelectedBackground(idx)}
                  >
                    <Box
                      component="img"
                      src={bg.image_url}
                      alt={`Background ${idx + 1}`}
                      sx={{
                        width: '100%',
                        height: 300,
                        objectFit: 'cover',
                      }}
                    />
                    {selectedBackground === idx && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          background: 'linear-gradient(135deg, #5B99C2 0%, #1A4870 100%)',
                          color: '#F9DBBA',
                          px: 2,
                          py: 0.5,
                          borderRadius: '20px',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                        }}
                      >
                        ✓ Selected
                      </Box>
                    )}
                    <CardContent>
                      <Typography variant="caption" sx={{ color: 'rgba(249, 219, 186, 0.7)' }}>
                        Option {idx + 1}
                      </Typography>
                    </CardContent>
                  </MotionCard>
                ))}
              </Box>
            )}

            {backgrounds.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => handleGenerateBackgrounds()}
                  disabled={loading}
                  sx={{
                    color: '#5B99C2',
                    borderColor: '#5B99C2',
                    '&:hover': {
                      borderColor: '#7FB3D5',
                      background: 'rgba(91, 153, 194, 0.1)',
                    },
                  }}
                >
                  Regenerate
                </Button>
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={handleHarmonize}
                  disabled={loading || selectedBackground === null}
                  sx={{
                    background: 'linear-gradient(135deg, #5B99C2 0%, #1A4870 100%)',
                    color: '#F9DBBA',
                    fontWeight: 700,
                    px: 4,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7FB3D5 0%, #1F316F 100%)',
                    },
                  }}
                >
                  Harmonize Design
                </Button>
              </Box>
            )}
          </MotionBox>
        );

      case 2:
        return (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#F9DBBA', fontWeight: 700, mb: 1 }}>
                Design Harmonization
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(249, 219, 186, 0.7)' }}>
                Adding event details and musicians to your poster
              </Typography>
            </Box>

            {harmonizedImages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CircularProgress sx={{ color: '#5B99C2', mb: 2 }} size={60} />
                <Typography sx={{ color: '#F9DBBA', fontSize: '1.1rem' }}>
                  Harmonizing your design...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
                {harmonizedImages.map((img, idx) => (
                  <MotionCard
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(249, 219, 186, 0.2)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src={img.image_url}
                      alt={`Harmonized ${idx + 1}`}
                      sx={{
                        width: '100%',
                        height: 500,
                        objectFit: 'cover',
                      }}
                    />
                    <CardContent>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Download />}
                        onClick={() => handleDownload(img.image_url, idx)}
                        sx={{
                          background: 'linear-gradient(135deg, #5B99C2 0%, #1A4870 100%)',
                          color: '#F9DBBA',
                          fontWeight: 700,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #7FB3D5 0%, #1F316F 100%)',
                          },
                        }}
                      >
                        Download Poster
                      </Button>
                    </CardContent>
                  </MotionCard>
                ))}
              </Box>
            )}
          </MotionBox>
        );

      case 3:
        return (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{ textAlign: 'center', py: 6 }}
          >
            <AutoAwesome sx={{ fontSize: '4rem', color: '#5B99C2', mb: 2 }} />
            <Typography variant="h4" sx={{ color: '#F9DBBA', fontWeight: 700, mb: 2 }}>
              Your Posters Are Ready!
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(249, 219, 186, 0.7)', mb: 4 }}>
              Download your AI-generated event posters and share them with the world.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => setActiveStep(1)}
              sx={{
                color: '#5B99C2',
                borderColor: '#5B99C2',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#7FB3D5',
                  background: 'rgba(91, 153, 194, 0.1)',
                },
              }}
            >
              Generate More
            </Button>
          </MotionBox>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1F316F 0%, #1A4870 50%, #5B99C2 100%)',
        py: 4,
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              color: '#F9DBBA',
              fontWeight: 800,
              mb: 1,
              background: 'linear-gradient(135deg, #F9DBBA 0%, #5B99C2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AI Poster Wizard
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(249, 219, 186, 0.8)' }}>
            Generate stunning event posters powered by your event plan
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    color: 'rgba(249, 219, 186, 0.6)',
                    fontWeight: 600,
                  },
                  '& .MuiStepLabel-label.Mui-active': {
                    color: '#F9DBBA',
                  },
                  '& .MuiStepLabel-label.Mui-completed': {
                    color: '#5B99C2',
                  },
                  '& .MuiStepIcon-root': {
                    color: 'rgba(91, 153, 194, 0.5)',
                  },
                  '& .MuiStepIcon-root.Mui-active': {
                    color: '#5B99C2',
                  },
                  '& .MuiStepIcon-root.Mui-completed': {
                    color: '#5B99C2',
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Content */}
        {renderStepContent()}

        {/* Snackbars */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setError(null)}
            severity="error"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSuccess(null)}
            severity="success"
            sx={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(91, 153, 194, 0.95) 0%, rgba(26, 72, 112, 0.95) 100%)',
              color: '#F9DBBA',
              fontWeight: 600,
            }}
          >
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
