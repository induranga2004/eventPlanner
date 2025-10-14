// frontend/src/pages/InteractivePlannerResults.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
  Fade,
  Slide,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const MotionCard = motion(Card);

function Currency({ value }) {
  const n = Number(value || 0);
  return <>LKR {n.toLocaleString()}</>;
}

function BudgetCard({ concept, selected, onSelect, onRefreshName, refreshing }) {
  const costCategories = [
    { key: 'venue', label: 'Venue', color: '#FF6B6B' },
    { key: 'music', label: 'Music', color: '#4ECDC4' },
    { key: 'lighting', label: 'Lighting', color: '#FFD93D' },
    { key: 'sound', label: 'Sound', color: '#95E1D3' },
  ];

  return (
    <MotionCard
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
      sx={{
        cursor: 'pointer',
        border: selected ? 3 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.3s ease',
      }}
    >
      {selected && (
        <Chip
          icon={<CheckCircleIcon />}
          label="Selected"
          color="primary"
          size="small"
          sx={{ position: 'absolute', top: -12, right: 16, zIndex: 1 }}
        />
      )}

      <CardContent>
        <Stack spacing={2}>
          {/* Concept Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {concept.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {concept.tagline || 'Custom event experience'}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRefreshName(concept.id);
              }}
              disabled={refreshing}
              sx={{ ml: 1 }}
            >
              {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Box>

          <Divider />

          {/* Total Budget */}
          <Box textAlign="center" py={1}>
            <Typography variant="caption" color="text.secondary">
              Total Budget
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary">
              <Currency value={concept.total_lkr} />
            </Typography>
          </Box>

          {/* Cost Breakdown */}
          <Stack spacing={1}>
            {concept.costs.map((cost) => {
              const categoryInfo = costCategories.find(c => c.key === cost.category) || { label: cost.category, color: '#999' };
              const percentage = ((cost.amount_lkr / concept.total_lkr) * 100).toFixed(0);

              return (
                <Box key={cost.category}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight="medium">
                      {categoryInfo.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {percentage}% · <Currency value={cost.amount_lkr} />
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: 'grey.200',
                      overflow: 'hidden',
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        background: categoryInfo.color,
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Stack>
      </CardContent>
    </MotionCard>
  );
}

function ProviderSelectionModal({ open, onClose, concept, campaignCity, budgetPerCategory }) {
  const [activeTab, setActiveTab] = useState(0);
  const [selections, setSelections] = useState({
    venue: null,
    music: [],
    lighting: null,
    sound: null,
  });
  const [providers, setProviders] = useState({
    venue: [],
    music: [],
    lighting: [],
    sound: [],
  });
  const [loading, setLoading] = useState(false);

  const tabs = [
    { label: 'Venue', key: 'venue' },
    { label: 'Music', key: 'music' },
    { label: 'Lighting', key: 'lighting' },
    { label: 'Sound', key: 'sound' },
  ];

  // Fetch providers when tab changes
  const fetchProviders = async (category) => {
    if (providers[category].length > 0) return; // Already loaded

    setLoading(true);
    try {
      const budget = budgetPerCategory[category] || 100000;
      const params = new URLSearchParams({
        limit: '12',
      });

      if (campaignCity) params.append('city', campaignCity);
      if (budget) params.append('max_budget_lkr', budget.toString());

      const response = await fetch(
        `http://localhost:1800/planner/providers/${category}?${params.toString()}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch providers');
      
      const data = await response.json();
      setProviders(prev => ({ ...prev, [category]: data }));
    } catch (error) {
      console.error(`Error fetching ${category} providers:`, error);
      setProviders(prev => ({ ...prev, [category]: [] }));
    } finally {
      setLoading(false);
    }
  };

  // Fetch providers when modal opens or tab changes
  useEffect(() => {
    if (open) {
      fetchProviders(tabs[activeTab].key);
    }
  }, [open, activeTab]);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    fetchProviders(tabs[newValue].key);
  };

  const handleSelect = (category, providerId) => {
    setSelections(prev => ({
      ...prev,
      [category]: category === 'music' 
        ? (prev[category].some(p => p === providerId)
            ? prev[category].filter(p => p !== providerId)
            : [...prev[category], providerId])
        : providerId
    }));
  };

  const isSelected = (category, providerId) => {
    if (category === 'music') {
      return selections[category].includes(providerId);
    }
    return selections[category] === providerId;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          Customize Your Event
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {concept?.title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            {tabs.map((tab, idx) => (
              <Tab
                key={tab.key}
                label={tab.label}
                icon={
                  (tab.key === 'music' 
                    ? selections[tab.key].length > 0
                    : selections[tab.key] !== null) && (
                    <CheckCircleIcon fontSize="small" color="success" />
                  )
                }
                iconPosition="end"
              />
            ))}
          </Tabs>
        </Box>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Typography variant="body2" color="text.secondary" mb={2}>
              {tabs[activeTab].key === 'music' 
                ? 'Select one or more musicians/bands (multi-select allowed)'
                : `Select your preferred ${tabs[activeTab].label.toLowerCase()} provider`}
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={2} sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                {providers[tabs[activeTab].key].length === 0 ? (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        No providers found for this category in {campaignCity || 'your area'}.
                        <br />Try adjusting your filters.
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  providers[tabs[activeTab].key].map((provider) => {
                    const currentCategory = tabs[activeTab].key;
                    const providerKey = provider.id || provider.name;
                    const selected = isSelected(currentCategory, providerKey);
                    
                    // Debug log
                    if (currentCategory === 'music') {
                      console.log('Music provider:', provider);
                    }

                    return (
                      <Card
                        key={providerKey}
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          border: 2,
                          borderColor: selected ? 'primary.main' : 'divider',
                          bgcolor: selected ? 'action.selected' : 'background.paper',
                          transition: 'all 0.2s',
                          minHeight: '100px',
                          '&:hover': { 
                            borderColor: 'primary.main',
                            transform: 'translateY(-2px)',
                            bgcolor: 'action.hover',
                          },
                        }}
                        onClick={() => handleSelect(currentCategory, providerKey)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            {selected ? (
                              <CheckCircleIcon color="primary" sx={{ mt: 0.5 }} />
                            ) : (
                              <RadioButtonUncheckedIcon color="action" sx={{ mt: 0.5 }} />
                            )}
                            <Box flex={1}>
                              <Typography 
                                variant="h6" 
                                fontWeight="bold" 
                                color="text.primary"
                                sx={{ mb: 1 }}
                              >
                                {provider.name || 'Unnamed Provider'}
                              </Typography>
                              
                              {/* Venue-specific details */}
                              {currentCategory === 'venue' && (
                                <Stack spacing={0.5} mt={1}>
                                  {provider.address && (
                                    <Typography variant="body2" color="text.secondary">
                                      📍 {provider.address}
                                    </Typography>
                                  )}
                                  {provider.capacity && (
                                    <Typography variant="body2" color="text.secondary">
                                      👥 Capacity: {provider.capacity} guests
                                    </Typography>
                                  )}
                                  {provider.standard_rate_lkr && (
                                    <Typography variant="body2" color="primary.main" fontWeight="medium">
                                      💰 LKR {provider.standard_rate_lkr.toLocaleString()}
                                    </Typography>
                                  )}
                                </Stack>
                              )}

                              {/* Music-specific details */}
                              {currentCategory === 'music' && (
                                <Stack spacing={0.5} mt={1}>
                                  {provider.provider_type && (
                                    <Chip 
                                      label={provider.provider_type === 'solo' ? 'Solo Musician' : 'Band'}
                                      size="small"
                                      color={provider.provider_type === 'band' ? 'secondary' : 'default'}
                                    />
                                  )}
                                  {provider.genres && (
                                    <Typography variant="body2" color="text.secondary">
                                      🎵 {Array.isArray(provider.genres) ? provider.genres.join(', ') : provider.genres}
                                    </Typography>
                                  )}
                                  {provider.members && (
                                    <Typography variant="body2" color="text.secondary">
                                      👥 {provider.members} members
                                    </Typography>
                                  )}
                                  {provider.experience && (
                                    <Typography variant="body2" color="text.secondary">
                                      ⭐ {provider.experience}
                                    </Typography>
                                  )}
                                  {provider.standard_rate_lkr ? (
                                    <Typography variant="body2" color="primary.main" fontWeight="medium">
                                      💰 LKR {provider.standard_rate_lkr.toLocaleString()}
                                    </Typography>
                                  ) : (
                                    <Typography variant="body2" color="text.disabled" fontStyle="italic">
                                      Contact for pricing
                                    </Typography>
                                  )}
                                  {provider.contact && (
                                    <Typography variant="body2" color="text.secondary">
                                      📞 {provider.contact}
                                    </Typography>
                                  )}
                                  {provider.spotify && (
                                    <Typography variant="body2" color="success.main">
                                      🎧 Spotify available
                                    </Typography>
                                  )}
                                </Stack>
                              )}

                              {/* Lighting-specific details */}
                              {currentCategory === 'lighting' && (
                                <Stack spacing={0.5} mt={1}>
                                  {provider.services && (
                                    <Typography variant="body2" color="text.secondary">
                                      🎨 {Array.isArray(provider.services) ? provider.services.join(', ') : provider.services}
                                    </Typography>
                                  )}
                                  {provider.crew_size && (
                                    <Typography variant="body2" color="text.secondary">
                                      👥 Crew size: {provider.crew_size}
                                    </Typography>
                                  )}
                                  {provider.standard_rate_lkr && (
                                    <Typography variant="body2" color="primary.main" fontWeight="medium">
                                      💰 LKR {provider.standard_rate_lkr.toLocaleString()}
                                    </Typography>
                                  )}
                                </Stack>
                              )}

                              {/* Sound-specific details */}
                              {currentCategory === 'sound' && (
                                <Stack spacing={0.5} mt={1}>
                                  {provider.services && (
                                    <Typography variant="body2" color="text.secondary">
                                      🔊 {Array.isArray(provider.services) ? provider.services.join(', ') : provider.services}
                                    </Typography>
                                  )}
                                  {provider.crew_size && (
                                    <Typography variant="body2" color="text.secondary">
                                      👥 Crew size: {provider.crew_size}
                                    </Typography>
                                  )}
                                  {provider.standard_rate_lkr && (
                                    <Typography variant="body2" color="primary.main" fontWeight="medium">
                                      💰 LKR {provider.standard_rate_lkr.toLocaleString()}
                                    </Typography>
                                  )}
                                </Stack>
                              )}

                              {/* Contact info */}
                              {(provider.website || provider.contact || provider.phone) && (
                                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                                  {provider.contact && (
                                    <Chip label={provider.contact} size="small" variant="outlined" />
                                  )}
                                  {provider.phone && (
                                    <Chip label={provider.phone} size="small" variant="outlined" />
                                  )}
                                  {provider.website && (
                                    <Chip 
                                      label="Website" 
                                      size="small" 
                                      variant="outlined"
                                      component="a"
                                      href={provider.website}
                                      target="_blank"
                                      clickable
                                    />
                                  )}
                                </Stack>
                              )}
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </Stack>
            )}
          </motion.div>
        </AnimatePresence>

        <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
          <Button onClick={onClose} variant="outlined">Cancel</Button>
          <Stack direction="row" spacing={2} alignItems="center">
            {activeTab > 0 && (
              <Button onClick={() => setActiveTab(activeTab - 1)}>
                Previous
              </Button>
            )}
            {activeTab < tabs.length - 1 ? (
              <Button 
                variant="contained"
                onClick={() => setActiveTab(activeTab + 1)}
              >
                Next: {tabs[activeTab + 1].label}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => {
                  console.log('Final selections:', selections);
                  console.log('Selected providers:', {
                    venue: providers.venue.find(p => (p.id || p.name) === selections.venue),
                    music: providers.music.filter(p => selections.music.includes(p.id || p.name)),
                    lighting: providers.lighting.find(p => (p.id || p.name) === selections.lighting),
                    sound: providers.sound.find(p => (p.id || p.name) === selections.sound),
                  });
                  onClose();
                }}
              >
                Confirm Selection
              </Button>
            )}
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default function InteractivePlannerResults({ data, campaignId }) {
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshingName, setRefreshingName] = useState(null);

  // Extract campaign city and budget info from data
  const campaignCity = data?.city || data?.event_details?.city || 'Colombo';
  
  const handleRefreshName = async (conceptId) => {
    setRefreshingName(conceptId);
    
    try {
      // Call your new /planner/regenerate-name endpoint
      const response = await fetch('http://127.0.0.1:1800/planner/regenerate-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vibe: 'high-energy musical night',
          city: campaignCity,
          budget_lkr: data?.budget_lkr || 1000000,
          attendees: data?.attendees || 150,
        }),
      });

      const { title, tagline } = await response.json();
      
      // Update concept in state (you'll need to implement this properly)
      console.log('New name:', title, tagline);
      // TODO: Update the concept title in your state
      
    } catch (error) {
      console.error('Failed to refresh name:', error);
    } finally {
      setRefreshingName(null);
    }
  };

  const handleSelectConcept = (concept) => {
    setSelectedConcept(concept);
    setModalOpen(true);
  };

  // Calculate budget per category from selected concept
  const getBudgetPerCategory = (concept) => {
    const budgets = {};
    if (concept && concept.costs) {
      concept.costs.forEach(cost => {
        budgets[cost.category] = cost.amount_lkr;
      });
    }
    return budgets;
  };

  if (!data || !data.concepts) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Fade in timeout={600}>
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Choose Your Event Style
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select a budget distribution that matches your vision, then customize providers
          </Typography>
        </Box>
      </Fade>

      <Grid container spacing={3}>
        {data.concepts.map((concept, index) => (
          <Grid item xs={12} md={6} key={concept.id}>
            <BudgetCard
              concept={concept}
              selected={selectedConcept?.id === concept.id}
              onSelect={() => handleSelectConcept(concept)}
              onRefreshName={handleRefreshName}
              refreshing={refreshingName === concept.id}
            />
          </Grid>
        ))}
      </Grid>

      <ProviderSelectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        concept={selectedConcept}
        campaignCity={campaignCity}
        budgetPerCategory={selectedConcept ? getBudgetPerCategory(selectedConcept) : {}}
      />
    </Box>
  );
}
