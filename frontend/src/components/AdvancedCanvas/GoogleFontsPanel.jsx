import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  Chip,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Button,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Font categories with cultural significance
const FONT_CATEGORIES = {
  sinhala: {
    label: 'Sinhala Fonts',
    fonts: [
      'Noto Sans Sinhala',
      'Iskoola Pota',
      'FM Abhaya',
      'FM Malithi UW',
      'DL Manel',
      'Bhashitha Complex'
    ],
    culturalContext: 'Traditional Sri Lankan script fonts for authentic local content'
  },
  tamil: {
    label: 'Tamil Fonts',
    fonts: [
      'Noto Sans Tamil',
      'TAB-Anna',
      'TAMu_Kadambri',
      'Tamil Sangam MN',
      'Latha'
    ],
    culturalContext: 'Tamil script fonts for Sri Lankan Tamil community content'
  },
  english_formal: {
    label: 'English Formal',
    fonts: [
      'Playfair Display',
      'Libre Baskerville',
      'Crimson Text',
      'EB Garamond',
      'Cormorant Garamond'
    ],
    culturalContext: 'Elegant serif fonts for formal occasions and official content'
  },
  english_modern: {
    label: 'English Modern',
    fonts: [
      'Inter',
      'Poppins',
      'Montserrat',
      'Open Sans',
      'Lato'
    ],
    culturalContext: 'Clean, contemporary fonts for modern designs'
  },
  cultural_display: {
    label: 'Cultural Display',
    fonts: [
      'Kalam',
      'Baloo Tammudu 2',
      'Hind Siliguri',
      'Mukti',
      'Tiro Bangla'
    ],
    culturalContext: 'Decorative fonts with South Asian aesthetic'
  }
};

// Cultural font recommendations based on intelligence data
const getCulturalFontRecommendations = (intelligenceData) => {
  if (!intelligenceData?.cultural_analysis) return [];

  const { cultural_themes, language_analysis } = intelligenceData.cultural_analysis;
  const recommendations = [];

  // Language-based recommendations
  if (language_analysis?.detected_language === 'mixed' || 
      language_analysis?.detected_language === 'sinhala') {
    recommendations.push({
      category: 'sinhala',
      reason: 'Detected Sinhala content - use authentic Sinhala typography'
    });
  }

  // Theme-based recommendations
  if (cultural_themes?.includes('traditional')) {
    recommendations.push({
      category: 'english_formal',
      reason: 'Traditional theme - elegant serif fonts recommended'
    });
  }

  if (cultural_themes?.includes('modern')) {
    recommendations.push({
      category: 'english_modern', 
      reason: 'Modern theme - clean sans-serif fonts recommended'
    });
  }

  if (cultural_themes?.includes('cultural')) {
    recommendations.push({
      category: 'cultural_display',
      reason: 'Cultural context - decorative South Asian fonts suggested'
    });
  }

  return recommendations;
};

const FontPreview = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '20'
  }
}));

const GoogleFontsPanel = ({ 
  onFontSelect, 
  selectedFont = 'Inter',
  intelligenceData = null 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fontSize, setFontSize] = useState(24);
  const [previewText, setPreviewText] = useState('Sample Text');
  const [loadedFonts, setLoadedFonts] = useState(new Set());
  const [showIntelligentSuggestions, setShowIntelligentSuggestions] = useState(true);

  // Get cultural font recommendations
  const culturalRecommendations = useMemo(() => 
    getCulturalFontRecommendations(intelligenceData),
    [intelligenceData]
  );

  // Load Google Fonts dynamically
  const loadFont = async (fontFamily) => {
    if (loadedFonts.has(fontFamily)) return;

    try {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      // Wait for font to load
      await new Promise((resolve) => {
        const checkFont = () => {
          if (document.fonts.check(`12px "${fontFamily}"`)) {
            resolve();
          } else {
            setTimeout(checkFont, 100);
          }
        };
        checkFont();
      });

      setLoadedFonts(prev => new Set([...prev, fontFamily]));
    } catch (error) {
      console.error(`Failed to load font: ${fontFamily}`, error);
    }
  };

  // Filter fonts based on search and category
  const filteredFonts = useMemo(() => {
    let fonts = [];

    if (selectedCategory === 'all') {
      fonts = Object.values(FONT_CATEGORIES).flatMap(category => category.fonts);
    } else if (FONT_CATEGORIES[selectedCategory]) {
      fonts = FONT_CATEGORIES[selectedCategory].fonts;
    }

    if (searchTerm) {
      fonts = fonts.filter(font => 
        font.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return fonts;
  }, [searchTerm, selectedCategory]);

  // Set preview text based on intelligence data
  useEffect(() => {
    if (intelligenceData?.original_query) {
      setPreviewText(intelligenceData.original_query);
    }
  }, [intelligenceData]);

  // Handle font selection
  const handleFontSelect = (fontFamily) => {
    loadFont(fontFamily);
    onFontSelect({
      family: fontFamily,
      size: fontSize,
      category: selectedCategory
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        🎨 Smart Font Selection
      </Typography>

      {/* Intelligent Suggestions */}
      {showIntelligentSuggestions && culturalRecommendations.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            🧠 Cultural Intelligence Suggestions:
          </Typography>
          {culturalRecommendations.map((rec, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Chip 
                label={FONT_CATEGORIES[rec.category]?.label}
                size="small"
                color="primary"
                sx={{ mr: 1 }}
              />
              <Typography variant="caption" display="block">
                {rec.reason}
              </Typography>
            </Box>
          ))}
        </Alert>
      )}

      {/* Controls */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search Fonts"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="all">All Fonts</MenuItem>
              {Object.entries(FONT_CATEGORIES).map(([key, category]) => (
                <MenuItem key={key} value={key}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Preview Text Input */}
      <TextField
        fullWidth
        label="Preview Text"
        value={previewText}
        onChange={(e) => setPreviewText(e.target.value)}
        sx={{ mb: 2 }}
        size="small"
        helperText="Enter text to preview fonts (auto-filled from your query)"
      />

      {/* Font Size Slider */}
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>
          Font Size: {fontSize}px
        </Typography>
        <Slider
          value={fontSize}
          onChange={(e, newValue) => setFontSize(newValue)}
          min={12}
          max={72}
          step={2}
          marks={[
            { value: 12, label: '12px' },
            { value: 24, label: '24px' },
            { value: 48, label: '48px' },
            { value: 72, label: '72px' }
          ]}
        />
      </Box>

      {/* Toggle for Intelligent Suggestions */}
      <FormControlLabel
        control={
          <Switch
            checked={showIntelligentSuggestions}
            onChange={(e) => setShowIntelligentSuggestions(e.target.checked)}
          />
        }
        label="Show Cultural Intelligence Suggestions"
        sx={{ mb: 2 }}
      />

      {/* Category Description */}
      {selectedCategory !== 'all' && FONT_CATEGORIES[selectedCategory] && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {FONT_CATEGORIES[selectedCategory].culturalContext}
          </Typography>
        </Alert>
      )}

      {/* Font Grid */}
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        <Grid container spacing={2}>
          {filteredFonts.map((font) => (
            <Grid item xs={12} key={font}>
              <FontPreview
                className={selectedFont === font ? 'selected' : ''}
                onClick={() => handleFontSelect(font)}
              >
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  color="textSecondary"
                >
                  {font}
                </Typography>
                <Typography
                  style={{
                    fontFamily: loadedFonts.has(font) ? font : 'inherit',
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.2
                  }}
                  onMouseEnter={() => loadFont(font)}
                >
                  {previewText}
                </Typography>
              </FontPreview>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Load More Fonts Button */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={() => {
            // Load popular fonts preemptively
            const popularFonts = ['Inter', 'Poppins', 'Montserrat', 'Open Sans'];
            popularFonts.forEach(font => loadFont(font));
          }}
        >
          Load Popular Fonts
        </Button>
      </Box>
    </Paper>
  );
};

export default GoogleFontsPanel;