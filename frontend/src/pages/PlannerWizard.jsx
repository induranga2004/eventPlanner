// frontend/src/pages/PlannerWizard.jsx
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  LinearProgress,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Fade,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  CalendarToday,
  People,
  AttachMoney,
  LocationOn,
  Event,
  AutoAwesome,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePlans } from "../api/planner";
import { gradients, animationVariants } from '../theme/eventPlannerTheme';

const MotionCard = motion(Card);

export default function PlannerWizard({ onGenerated }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    campaign_id: crypto.randomUUID(),
    event_name: "",
    venue: "",
    event_date: "",
    attendees_estimate: 100,
    total_budget_lkr: 1000000,
    number_of_concepts: 2,
  });

  const steps = ['Event Details', 'Attendees & Budget', 'Concept Options'];
  const maxStep = steps.length - 1;
  
  const next = () => setStep((s) => Math.min(s + 1, maxStep));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: ["attendees_estimate", "total_budget_lkr", "number_of_concepts"].includes(name) ? Number(value) : value
    }));
  };

  const submit = async () => {
    if (!form.event_name || form.event_name.length < 3) return alert("Event name must be at least 3 characters.");
    if (!form.venue || form.venue.trim().length < 2) return alert("Venue is required.");
    if (!form.event_date) return alert("Event date is required.");
    if (form.attendees_estimate < 1) return alert("Attendees must be ≥ 1.");
    if (form.total_budget_lkr < 50000) return alert("Budget must be ≥ LKR 50,000.");

    try {
      setLoading(true);
      const data = await generatePlans(form);
      onGenerated(data, form.campaign_id);
    } catch (e) {
      alert("Failed to generate: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const conceptOptions = [1, 2, 3, 4];

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Hero Header */}
        <motion.div {...animationVariants.slideUp}>
          <Box
            sx={{
              textAlign: 'center',
              mb: 6,
              background: gradients.primary,
              borderRadius: 4,
              p: 4,
              color: 'white',
              boxShadow: '0px 8px 24px rgba(45, 95, 127, 0.3)',
            }}
          >
            <AutoAwesome sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Musical Event Planner AI
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Create unforgettable events with AI-powered planning
            </Typography>
          </Box>
        </motion.div>

        {/* Stepper */}
        <motion.div {...animationVariants.fadeIn}>
          <Stepper activeStep={step} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </motion.div>

        {/* Progress Bar */}
        <LinearProgress 
          variant="determinate" 
          value={((step + 1) / steps.length) * 100} 
          sx={{ mb: 4, height: 6, borderRadius: 3 }}
        />

        {/* Form Cards */}
        <AnimatePresence mode="wait">
          <MotionCard
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            elevation={3}
            sx={{ borderRadius: 3, overflow: 'hidden' }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Step 1: Event Details */}
              {step === 0 && (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Tell us about your event
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Let's start with the basics
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Event Name"
                    name="event_name"
                    value={form.event_name}
                    onChange={onChange}
                    placeholder="e.g., Summer Music Festival 2025"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Event color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Venue / Location"
                    name="venue"
                    value={form.venue}
                    onChange={onChange}
                    placeholder="e.g., Colombo Convention Center"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    type="date"
                    label="Event Date"
                    name="event_date"
                    value={form.event_date}
                    onChange={onChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              )}

              {/* Step 2: Attendees & Budget */}
              {step === 1 && (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Event Scale & Budget
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Help us understand the size and budget of your event
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    type="number"
                    label="Expected Attendees"
                    name="attendees_estimate"
                    value={form.attendees_estimate}
                    onChange={onChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <People color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    type="number"
                    label="Total Budget (LKR)"
                    name="total_budget_lkr"
                    value={form.total_budget_lkr}
                    onChange={onChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #F8FAFB 0%, #E2E8F0 100%)',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      💡 Your budget will be intelligently distributed across venue, music, lighting, and sound
                    </Typography>
                  </Box>
                </Stack>
              )}

              {/* Step 3: Concept Options */}
              {step === 2 && (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Concept Variations
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      How many budget concepts would you like to explore?
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      Number of Concepts
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      {conceptOptions.map((num) => (
                        <Chip
                          key={num}
                          label={`${num} Concept${num > 1 ? 's' : ''}`}
                          onClick={() => setForm(f => ({ ...f, number_of_concepts: num }))}
                          color={form.number_of_concepts === num ? 'primary' : 'default'}
                          variant={form.number_of_concepts === num ? 'filled' : 'outlined'}
                          sx={{
                            px: 2,
                            py: 2.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background: gradients.accent,
                      color: 'white',
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      ✨ Each concept offers a unique budget distribution strategy, 
                      giving you flexibility to choose what works best for your event
                    </Typography>
                  </Box>
                </Stack>
              )}
            </CardContent>

            {/* Action Buttons */}
            <Box
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #F8FAFB 0%, #FFFFFF 100%)',
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button
                  size="large"
                  onClick={back}
                  disabled={step === 0 || loading}
                  sx={{ minWidth: 120 }}
                >
                  Back
                </Button>

                {step < maxStep ? (
                  <Button
                    size="large"
                    variant="contained"
                    onClick={next}
                    disabled={loading}
                    sx={{ minWidth: 120 }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    size="large"
                    variant="contained"
                    onClick={submit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
                    sx={{
                      minWidth: 180,
                      background: gradients.primary,
                      '&:hover': {
                        background: gradients.primary,
                        transform: 'scale(1.02)',
                      },
                    }}
                  >
                    {loading ? 'Generating...' : 'Generate Plans'}
                  </Button>
                )}
              </Stack>
            </Box>
          </MotionCard>
        </AnimatePresence>
      </Box>
    </Container>
  );
}

