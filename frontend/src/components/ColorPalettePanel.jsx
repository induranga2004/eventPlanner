import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
  Alert,
  Paper,
  IconButton,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Palette,
  Colorize,
  AutoAwesome,
  Refresh,
  Star,
  StarBorder
} from '@mui/icons-material';

// Cultural color palettes for Sri Lankan context
const CULTURAL_COLOR_PALETTES = {
  'slpp': {
    name: 'SLPP (Nelum Kuluna)',
    colors: ['#2E8B57', '#228B22', '#32CD32', '#90EE90', '#F0F8FF'],
    description: 'Sri Lanka Podujana Peramuna colors',
    category: 'Political'
  },
  'unp': {
    name: 'UNP (Elephant)',
    colors: ['#006400', '#228B22', '#FFD700', '#FFFFFF', '#000000'],
    description: 'United National Party colors',
    category: 'Political'
  },
  'sinhala-traditional': {
    name: 'Sinhala Traditional',
    colors: ['#8B0000', '#FFD700', '#FF4500', '#FFFFFF', '#000000'],
    description: 'Traditional Sinhala ceremonial colors',
    category: 'Cultural'
  },
  'tamil-traditional': {
    name: 'Tamil Traditional',
    colors: ['#8B0000', '#FFD700', '#FF0000', '#FFFFFF', '#000000'],
    description: 'Traditional Tamil ceremonial colors',
    category: 'Cultural'
  },
  'buddhist': {
    name: 'Buddhist Colors',
    colors: ['#FF8C00', '#FFD700', '#8B0000', '#FFFFFF', '#000080'],
    description: 'Buddhist flag and ceremonial colors',
    category: 'Religious'
  },
  'vesak': {
    name: 'Vesak Festival',
    colors: ['#FFD700', '#FF4500', '#8A2BE2', '#00FF00', '#FFFFFF'],
    description: 'Vesak lantern and decoration colors',
    category: 'Festival'
  },
  'independence': {
    name: 'Independence Day',
    colors: ['#8B0000', '#FFD700', '#006400', '#FFFFFF', '#000080'],
    description: 'Sri Lankan flag colors',
    category: 'National'
  }
};

const MODERN_PALETTES = {
  'tropical': {
    name: 'Tropical Modern',
    colors: ['#00CED1', '#FF6347', '#32CD32', '#FFD700', '#FFFFFF'],
    description: 'Modern tropical colors',
    category: 'Modern'
  },
  'corporate': {
    name: 'Corporate Sri Lanka',
    colors: ['#2F4F4F', '#4682B4', '#87CEEB', '#F0F8FF', '#FFFFFF'],
    description: 'Professional business colors',
    category: 'Business'
  },
  'tech': {
    name: 'Tech Forward',
    colors: ['#1E1E1E', '#4169E1', '#00FFFF', '#90EE90', '#FFFFFF'],
    description: 'Modern technology colors',
    category: 'Technology'
  }
};

const ColorPalettePanel = ({ canvas, intelligenceData, onColorSelect }) => {
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [customColors, setCustomColors] = useState(['#FF0000', '#00FF00', '#0000FF']);
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [colorHistory, setColorHistory] = useState([]);
  const [favorites, setFavorites] = useState(['slpp', 'buddhist', 'independence']);

  // Auto-suggest palette based on intelligence data
  useEffect(() => {
    if (intelligenceData?.cultural_analysis) {
      const analysis = intelligenceData.cultural_analysis;
      
      // Auto-select palette based on cultural context
      if (analysis.context?.political && analysis.context.political.includes('SLPP')) {
        setSelectedPalette('slpp');
      } else if (analysis.themes?.includes('traditional')) {
        setSelectedPalette('sinhala-traditional');
      } else if (analysis.themes?.includes('religious')) {
        setSelectedPalette('buddhist');
      } else {
        setSelectedPalette('independence'); // Default to national colors
      }
    }
  }, [intelligenceData]);

  const handlePaletteSelect = (paletteKey, palette) => {
    setSelectedPalette(paletteKey);
    
    if (onColorSelect) {
      onColorSelect({
        palette: paletteKey,
        colors: palette.colors,
        name: palette.name
      });
    }

    // Apply primary color to canvas background
    if (canvas && palette.colors.length > 0) {
      canvas.backgroundColor = palette.colors[0] + '20'; // Light background
      canvas.renderAll();
    }
  };

  const handleColorClick = (color, index) => {
    setActiveColorIndex(index);
    
    // Add to history
    if (!colorHistory.includes(color)) {
      setColorHistory(prev => [color, ...prev.slice(0, 9)]); // Keep last 10
    }

    // Apply color to selected canvas object
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        if (activeObject.type === 'text') {
          activeObject.set('fill', color);
        } else {
          activeObject.set('fill', color);
        }
        canvas.renderAll();
      }
    }

    if (onColorSelect) {
      onColorSelect({ color, index });
    }
  };

  const toggleFavorite = (paletteKey) => {
    setFavorites(prev => 
      prev.includes(paletteKey) 
        ? prev.filter(f => f !== paletteKey)
        : [...prev, paletteKey]
    );
  };

  const generateSmartPalette = () => {
    if (!intelligenceData?.cultural_analysis) return;

    // Generate colors based on cultural context
    const themes = intelligenceData.cultural_analysis.themes || [];
    let generatedColors = [];

    if (themes.includes('traditional')) {
      generatedColors = ['#8B0000', '#FFD700', '#FF4500', '#FFFFFF', '#000000'];
    } else if (themes.includes('modern')) {
      generatedColors = ['#2F4F4F', '#4682B4', '#87CEEB', '#32CD32', '#FFFFFF'];
    } else {
      // Default cultural colors
      generatedColors = ['#006400', '#FFD700', '#8B0000', '#FFFFFF', '#000080'];
    }

    setCustomColors(generatedColors);
    setSelectedPalette('custom');
  };

  const allPalettes = { ...CULTURAL_COLOR_PALETTES, ...MODERN_PALETTES };
  const favoritesPalettes = favorites.map(key => ({ key, ...allPalettes[key] })).filter(p => p.name);
  const culturalPalettes = Object.entries(CULTURAL_COLOR_PALETTES);
  const modernPalettes = Object.entries(MODERN_PALETTES);

  return (
    <Card sx={{ height: 'fit-content' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🎨 Cultural Color Palettes
        </Typography>

        {/* Intelligence-based suggestions */}
        {intelligenceData?.cultural_analysis && (
          <Alert severity="info" sx={{ mb: 2 }}>
            🧠 <strong>AI Suggestion:</strong> Based on "{intelligenceData.original_query}", 
            we recommend {selectedPalette ? allPalettes[selectedPalette]?.name : 'traditional Sri Lankan'} colors.
          </Alert>
        )}

        {/* Smart Palette Generation */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<AutoAwesome />}
            onClick={generateSmartPalette}
            fullWidth
            size="small"
          >
            Generate Smart Palette
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Favorites */}
        {favoritesPalettes.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              ⭐ Favorites
            </Typography>
            {favoritesPalettes.map(({ key, name, colors, description }) => (
              <Box key={key} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => toggleFavorite(key)}
                  >
                    <Star color="primary" />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  {colors.map((color, index) => (
                    <Box
                      key={index}
                      onClick={() => handleColorClick(color, index)}
                      sx={{
                        width: 30,
                        height: 30,
                        backgroundColor: color,
                        border: '2px solid #ddd',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          transition: 'transform 0.2s'
                        }
                      }}
                    />
                  ))}
                </Box>
                <Button
                  size="small"
                  onClick={() => handlePaletteSelect(key, { name, colors, description })}
                  variant={selectedPalette === key ? "contained" : "outlined"}
                >
                  Use Palette
                </Button>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
          </Box>
        )}

        {/* Cultural Palettes */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            🏛️ Cultural & Political
          </Typography>
          {culturalPalettes.map(([key, palette]) => (
            <Box key={key} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {palette.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => toggleFavorite(key)}
                >
                  {favorites.includes(key) ? 
                    <Star color="primary" /> : 
                    <StarBorder />
                  }
                </IconButton>
              </Box>
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                {palette.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                {palette.colors.map((color, index) => (
                  <Box
                    key={index}
                    onClick={() => handleColorClick(color, index)}
                    sx={{
                      width: 30,
                      height: 30,
                      backgroundColor: color,
                      border: '2px solid #ddd',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        transition: 'transform 0.2s'
                      }
                    }}
                  />
                ))}
              </Box>
              <Button
                size="small"
                onClick={() => handlePaletteSelect(key, palette)}
                variant={selectedPalette === key ? "contained" : "outlined"}
              >
                Use Palette
              </Button>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Modern Palettes */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            🎨 Modern & Business
          </Typography>
          {modernPalettes.map(([key, palette]) => (
            <Box key={key} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {palette.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => toggleFavorite(key)}
                >
                  {favorites.includes(key) ? 
                    <Star color="primary" /> : 
                    <StarBorder />
                  }
                </IconButton>
              </Box>
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                {palette.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                {palette.colors.map((color, index) => (
                  <Box
                    key={index}
                    onClick={() => handleColorClick(color, index)}
                    sx={{
                      width: 30,
                      height: 30,
                      backgroundColor: color,
                      border: '2px solid #ddd',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        transition: 'transform 0.2s'
                      }
                    }}
                  />
                ))}
              </Box>
              <Button
                size="small"
                onClick={() => handlePaletteSelect(key, palette)}
                variant={selectedPalette === key ? "contained" : "outlined"}
              >
                Use Palette
              </Button>
            </Box>
          ))}
        </Box>

        {/* Color History */}
        {colorHistory.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              🕒 Recent Colors
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {colorHistory.map((color, index) => (
                <Box
                  key={index}
                  onClick={() => handleColorClick(color, index)}
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: color,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.2)',
                      transition: 'transform 0.2s'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Usage Tips */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            💡 <strong>Cultural Color Tips:</strong><br />
            • SLPP: Green tones represent growth and prosperity<br />
            • Buddhist: Saffron and gold for spiritual significance<br />
            • National: Flag colors for patriotic themes<br />
            • Click colors to apply to selected objects
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ColorPalettePanel;