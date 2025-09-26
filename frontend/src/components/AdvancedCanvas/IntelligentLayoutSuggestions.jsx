import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  ExpandMore,
  AutoAwesome,
  Palette,
  TextFields,
  CropFree,
  TrendingUp,
  Lightbulb,
  CheckCircle
} from '@mui/icons-material';

// Smart layout templates based on cultural intelligence
const INTELLIGENT_LAYOUTS = {
  formal_portrait: {
    name: 'Formal Portrait',
    description: 'Professional layout for official portraits and formal events',
    culturalContext: 'Suitable for political figures, ceremonial events',
    elements: {
      title: { x: 0.1, y: 0.1, width: 0.8, height: 0.15 },
      image: { x: 0.2, y: 0.3, width: 0.6, height: 0.4 },
      subtitle: { x: 0.1, y: 0.75, width: 0.8, height: 0.1 },
      decoration: { x: 0.05, y: 0.85, width: 0.9, height: 0.1 }
    },
    colors: ['#1B4332', '#2D6A4F', '#40916C', '#F7F7F7'],
    typography: 'serif'
  },
  cultural_celebration: {
    name: 'Cultural Celebration',
    description: 'Vibrant layout for festivals and cultural events',
    culturalContext: 'Perfect for Vesak, New Year, cultural festivals',
    elements: {
      header: { x: 0.05, y: 0.05, width: 0.9, height: 0.2 },
      central_image: { x: 0.15, y: 0.3, width: 0.7, height: 0.35 },
      side_elements: { x: 0.02, y: 0.25, width: 0.1, height: 0.45 },
      footer: { x: 0.1, y: 0.75, width: 0.8, height: 0.2 }
    },
    colors: ['#FF6B35', '#F7931E', '#FFD23F', '#EE4B2B'],
    typography: 'decorative'
  },
  modern_minimal: {
    name: 'Modern Minimal',
    description: 'Clean, contemporary layout with lots of white space',
    culturalContext: 'Suitable for modern businesses, tech companies',
    elements: {
      logo: { x: 0.05, y: 0.05, width: 0.2, height: 0.1 },
      main_text: { x: 0.1, y: 0.25, width: 0.6, height: 0.3 },
      accent: { x: 0.75, y: 0.2, width: 0.2, height: 0.6 },
      footer_info: { x: 0.1, y: 0.85, width: 0.8, height: 0.1 }
    },
    colors: ['#FFFFFF', '#2C3E50', '#3498DB', '#E8E8E8'],
    typography: 'sans-serif'
  },
  traditional_poster: {
    name: 'Traditional Poster',
    description: 'Classic poster layout with cultural motifs',
    culturalContext: 'Traditional events, temple festivals, heritage sites',
    elements: {
      border: { x: 0.02, y: 0.02, width: 0.96, height: 0.96 },
      title: { x: 0.1, y: 0.1, width: 0.8, height: 0.2 },
      main_content: { x: 0.1, y: 0.35, width: 0.8, height: 0.4 },
      ornaments: { x: 0.05, y: 0.05, width: 0.9, height: 0.9 }
    },
    colors: ['#8B4513', '#DAA520', '#B22222', '#F5DEB3'],
    typography: 'traditional'
  }
};

// Analyze cultural context and suggest layouts
const analyzeAndSuggestLayouts = (intelligenceData) => {
  if (!intelligenceData?.cultural_analysis) return [];

  const { cultural_themes, design_strategy } = intelligenceData.cultural_analysis;
  const suggestions = [];

  // Theme-based suggestions
  if (cultural_themes?.includes('political')) {
    suggestions.push({
      layout: 'formal_portrait',
      confidence: 0.9,
      reason: 'Political context detected - formal presentation recommended'
    });
  }

  if (cultural_themes?.includes('traditional') || cultural_themes?.includes('cultural')) {
    suggestions.push({
      layout: 'traditional_poster',
      confidence: 0.85,
      reason: 'Traditional/cultural theme - heritage-style layout suggested'
    });
    
    suggestions.push({
      layout: 'cultural_celebration',
      confidence: 0.8,
      reason: 'Cultural context - celebration layout with traditional elements'
    });
  }

  if (design_strategy?.formality_level > 0.7) {
    suggestions.push({
      layout: 'formal_portrait',
      confidence: 0.8,
      reason: 'High formality level - professional layout recommended'
    });
  }

  if (design_strategy?.layout_style === 'centered' || design_strategy?.layout_style === 'modern') {
    suggestions.push({
      layout: 'modern_minimal',
      confidence: 0.7,
      reason: 'Modern aesthetic - clean minimal design suggested'
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
};

const IntelligentLayoutSuggestions = ({ 
  intelligenceData = null,
  onLayoutSelect,
  onApplyRecommendation 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (intelligenceData) {
      setLoading(true);
      // Simulate processing time for more realistic feel
      setTimeout(() => {
        const newSuggestions = analyzeAndSuggestLayouts(intelligenceData);
        setSuggestions(newSuggestions);
        setLoading(false);
      }, 1000);
    }
  }, [intelligenceData]);

  const handleLayoutSelect = (layoutKey) => {
    const layout = INTELLIGENT_LAYOUTS[layoutKey];
    setSelectedLayout(layoutKey);
    
    if (onLayoutSelect) {
      onLayoutSelect({
        key: layoutKey,
        ...layout
      });
    }
  };

  const applyIntelligentRecommendation = (recommendation) => {
    if (onApplyRecommendation) {
      onApplyRecommendation({
        layout: INTELLIGENT_LAYOUTS[recommendation.layout],
        confidence: recommendation.confidence,
        reason: recommendation.reason,
        intelligenceData: intelligenceData
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        🧠 Intelligent Layout Suggestions
      </Typography>

      {/* Intelligence Status */}
      {intelligenceData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">
            Cultural Analysis Complete
          </Typography>
          <Typography variant="body2">
            Query: "{intelligenceData.original_query}"
            <br />
            Confidence: {Math.round((intelligenceData.cultural_analysis?.confidence_score || 0) * 100)}%
            <br />
            Themes: {intelligenceData.cultural_analysis?.cultural_themes?.join(', ') || 'None detected'}
          </Typography>
        </Alert>
      )}

      {loading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Analyzing cultural context...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {/* AI Recommendations */}
      {suggestions.length > 0 && (
        <Accordion defaultExpanded sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AutoAwesome color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                Smart Recommendations ({suggestions.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {suggestions.map((suggestion, index) => {
                const layout = INTELLIGENT_LAYOUTS[suggestion.layout];
                return (
                  <ListItem 
                    key={index}
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 1, 
                      mb: 1,
                      backgroundColor: index === 0 ? 'primary.light' : 'background.paper',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      <TrendingUp color={index === 0 ? 'primary' : 'action'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            {layout.name}
                          </Typography>
                          <Chip 
                            label={`${Math.round(suggestion.confidence * 100)}% match`}
                            size="small"
                            color={index === 0 ? 'primary' : 'default'}
                          />
                          {index === 0 && (
                            <Chip label="Best Match" size="small" color="success" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {suggestion.reason}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {layout.culturalContext}
                          </Typography>
                        </Box>
                      }
                    />
                    <Button
                      variant={index === 0 ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => applyIntelligentRecommendation(suggestion)}
                      startIcon={<CheckCircle />}
                    >
                      Apply
                    </Button>
                  </ListItem>
                );
              })}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* All Layout Options */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        All Layout Templates
      </Typography>
      
      <Grid container spacing={2}>
        {Object.entries(INTELLIGENT_LAYOUTS).map(([key, layout]) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: selectedLayout === key ? 2 : 1,
                borderColor: selectedLayout === key ? 'primary.main' : 'divider',
                '&:hover': { 
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                },
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleLayoutSelect(key)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CropFree color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {layout.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="textSecondary" paragraph>
                  {layout.description}
                </Typography>

                <Typography variant="caption" color="textSecondary" paragraph>
                  {layout.culturalContext}
                </Typography>

                {/* Color Palette Preview */}
                <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                  {layout.colors.slice(0, 4).map((color, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: color,
                        borderRadius: 0.5,
                        border: 1,
                        borderColor: 'divider'
                      }}
                    />
                  ))}
                </Box>

                <Chip 
                  label={`${layout.typography} typography`}
                  size="small"
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Cultural Design Tips */}
      <Paper elevation={1} sx={{ p: 2, mt: 3, backgroundColor: 'warning.light' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Lightbulb color="warning" sx={{ mr: 1, mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Cultural Design Tips
            </Typography>
            <Typography variant="body2">
              • Use formal layouts for political content and official events
              • Incorporate traditional motifs for cultural celebrations
              • Consider Sinhala/Tamil typography for local audience
              • Respect cultural symbols and their proper usage
              • Balance modern aesthetics with cultural authenticity
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default IntelligentLayoutSuggestions;