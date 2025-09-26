import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Palette,
  TextFields,
  CropFree,
  Psychology,
  Save,
  Download,
  Settings,
  Menu,
  Close,
  GetApp,
  Search,
  Send
} from '@mui/icons-material';

import CanvasEditor from './FastCanvas';
import GoogleFontsPanel from './GoogleFontsPanel';
import IntelligentLayoutSuggestions from './IntelligentLayoutSuggestions';
import ExportPanel from '../ExportPanel';
import ColorPalettePanel from '../ColorPalettePanel';

// API integration for Phase 1 intelligence
const fetchIntelligenceAnalysis = async (query, context = 'design', language = 'mixed') => {
  try {
    console.log(`Making API request to: http://localhost:8000/api/intelligence/analyze`);
    console.log(`Query: ${query}, Context: ${context}, Language: ${language}`);
    
    const response = await fetch('http://localhost:8000/api/intelligence/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        context: context,
        language: language
      })
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch intelligence analysis:', error);
    return {
      original_query: query,
      cultural_analysis: {
        confidence_score: 0.3,
        themes: ['traditional', 'cultural', 'local'],
        design_strategy: {
          typography: { primary_font: 'Inter' },
          color_palette: { primary_colors: ['#2E8B57', '#FFD700'] }
        }
      }
    };
  }
};

const AdvancedDesignEditor = () => {
  const [canvas, setCanvas] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [designQuery, setDesignQuery] = useState('');
  const [customQuery, setCustomQuery] = useState('');

  // Sample queries for testing
  const sampleQueries = [
    'mahinda mahaththaya with nelum kuluna colombo',
    'sri lankan independence day celebration',
    'vesak festival poster design',
    'modern business presentation sri lanka'
  ];

  // Initialize with a sample query for demonstration
  useEffect(() => {
    handleIntelligentAnalysis('mahinda mahaththaya with nelum kuluna colombo');
  }, []);

  // Handle intelligent analysis
  const handleIntelligentAnalysis = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setDesignQuery(query);
    
    try {
      const result = await fetchIntelligenceAnalysis(query, 'poster design', 'mixed');
      
      if (result) {
        setIntelligenceData(result);
        showNotification('Cultural intelligence analysis complete!', 'success');
      } else {
        showNotification('Failed to analyze query. Using fallback suggestions.', 'warning');
      }
    } catch (error) {
      console.error('Intelligence analysis error:', error);
      showNotification('Intelligence service unavailable. Using basic suggestions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle canvas ready
  const handleCanvasReady = (fabricCanvas) => {
    setCanvas(fabricCanvas);
    showNotification('Advanced canvas initialized!', 'success');
  };

  // Handle font selection
  const handleFontSelect = (fontData) => {
    setSelectedFont(fontData.family);
    
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === 'text') {
        activeObject.set('fontFamily', fontData.family);
        activeObject.set('fontSize', fontData.size);
        canvas.renderAll();
      }
    }
    
    showNotification(`Font changed to ${fontData.family}`, 'success');
  };

  // Handle layout selection
  const handleLayoutSelect = (layoutData) => {
    if (!canvas) return;

    // Clear canvas
    canvas.clear();
    canvas.backgroundColor = 'white';

    // Apply layout template
    applyLayoutTemplate(layoutData);
    
    showNotification(`Applied ${layoutData.name} layout`, 'success');
  };

  // Apply intelligent layout recommendation
  const handleApplyRecommendation = (recommendation) => {
    if (!canvas || !recommendation.layout) return;

    // Clear canvas
    canvas.clear();
    
    // Apply recommended layout with intelligence data
    applyIntelligentLayout(recommendation.layout, recommendation.intelligenceData);
    
    showNotification(
      `Applied AI recommendation: ${recommendation.layout.name} (${Math.round(recommendation.confidence * 100)}% match)`,
      'success'
    );
  };

  // Apply layout template to canvas
  const applyLayoutTemplate = (layout) => {
    if (!canvas || !layout.elements) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Apply background color
    if (layout.colors && layout.colors.length > 0) {
      canvas.backgroundColor = layout.colors[0];
    }

    // Add template elements
    Object.entries(layout.elements).forEach(([elementType, position]) => {
      const left = position.x * canvasWidth;
      const top = position.y * canvasHeight;
      const width = position.width * canvasWidth;
      const height = position.height * canvasHeight;

      if (elementType.includes('text') || elementType.includes('title') || elementType.includes('subtitle')) {
        // Add text elements
        const text = new fabric.Text(`${elementType.replace('_', ' ').toUpperCase()}`, {
          left: left,
          top: top,
          width: width,
          fontSize: elementType.includes('title') ? 32 : 24,
          fill: layout.colors && layout.colors.length > 1 ? layout.colors[1] : '#333333',
          fontFamily: selectedFont
        });
        canvas.add(text);
      } else {
        // Add placeholder rectangles for other elements
        const rect = new fabric.Rect({
          left: left,
          top: top,
          width: width,
          height: height,
          fill: layout.colors && layout.colors.length > 2 ? layout.colors[2] + '40' : '#e0e0e040',
          stroke: layout.colors && layout.colors.length > 1 ? layout.colors[1] : '#333333',
          strokeWidth: 2,
          rx: 5,
          ry: 5
        });
        canvas.add(rect);

        // Add label
        const label = new fabric.Text(elementType.replace('_', ' '), {
          left: left + width / 2,
          top: top + height / 2,
          fontSize: 14,
          fill: '#666666',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        });
        canvas.add(label);
      }
    });

    canvas.renderAll();
  };

  // Apply intelligent layout with cultural context
  const applyIntelligentLayout = (layout, intelligence) => {
    applyLayoutTemplate(layout);

    // Add cultural content if available
    if (intelligence?.original_query && canvas) {
      const queryText = new fabric.Text(intelligence.original_query, {
        left: canvas.width / 2,
        top: 50,
        fontSize: 28,
        fill: layout.colors[1] || '#333333',
        fontFamily: selectedFont,
        textAlign: 'center',
        originX: 'center'
      });
      canvas.add(queryText);
    }

    // Apply cultural color palette if available
    if (intelligence?.cultural_analysis?.design_strategy?.color_palette) {
      const culturalColors = intelligence.cultural_analysis.design_strategy.color_palette.primary_colors;
      if (culturalColors && culturalColors.length > 0) {
        canvas.backgroundColor = culturalColors[0] + '20'; // Light background
      }
    }
  };

  // Show notification
  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Tab panel component
  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ height: '100%' }}>
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setSidebarOpen(true)}
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            🎨 Advanced Cultural Design Editor - Phase 2
          </Typography>

          {intelligenceData && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              🧠 AI Confidence: {Math.round((intelligenceData.cultural_analysis?.confidence_score || 0) * 100)}%
            </Typography>
          )}

          <Button
            color="inherit"
            startIcon={<Save />}
            onClick={() => showNotification('Design saved!', 'success')}
          >
            Save
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar - Tools */}
        <Box sx={{ width: 400, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<Psychology />} label="AI Layouts" />
            <Tab icon={<TextFields />} label="Fonts" />
            <Tab icon={<Palette />} label="Colors" />
            <Tab icon={<GetApp />} label="Export" />
          </Tabs>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <TabPanel value={activeTab} index={0}>
              <IntelligentLayoutSuggestions
                intelligenceData={intelligenceData}
                onLayoutSelect={handleLayoutSelect}
                onApplyRecommendation={handleApplyRecommendation}
              />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <GoogleFontsPanel
                onFontSelect={handleFontSelect}
                selectedFont={selectedFont}
                intelligenceData={intelligenceData}
              />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <ColorPalettePanel
                canvas={canvas}
                intelligenceData={intelligenceData}
                onColorSelect={(colorData) => {
                  showNotification(
                    `Applied ${colorData.palette ? colorData.name : 'color'}: ${colorData.color || 'palette'}`,
                    'success'
                  );
                }}
              />
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <ExportPanel
                canvas={canvas}
                onExport={(exportData) => {
                  showNotification(
                    `Export completed: ${exportData.format} (${exportData.dimensions.width}×${exportData.dimensions.height})`,
                    'success'
                  );
                }}
              />
            </TabPanel>
          </Box>
        </Box>

        {/* Main Canvas Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {loading && (
            <Alert severity="info" sx={{ m: 2 }}>
              🧠 Analyzing cultural context: "{designQuery}"...
            </Alert>
          )}

          {/* Cultural Query Input */}
          <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter cultural query: mahinda rajapaksa, vesak festival, sri lankan independence..."
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && customQuery.trim()) {
                  handleIntelligentAnalysis(customQuery);
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Psychology color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => customQuery.trim() && handleIntelligentAnalysis(customQuery)}
                      disabled={!customQuery.trim() || loading}
                    >
                      <Send />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              helperText="🧠 Enter Sri Lankan cultural, political, or religious terms for intelligent design suggestions"
            />
          </Box>

          <Box sx={{ flex: 1, p: 2 }}>
            <CanvasEditor
              width={800}
              height={600}
              onCanvasReady={handleCanvasReady}
              intelligenceData={intelligenceData}
            />
          </Box>
        </Box>
      </Box>

      {/* Quick Actions Sidebar */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Quick Actions</Typography>
            <IconButton onClick={() => setSidebarOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Try Sample Queries:
          </Typography>

          <List>
            {sampleQueries.map((query, index) => (
              <ListItem
                key={index}
                button
                onClick={() => {
                  handleIntelligentAnalysis(query);
                  setSidebarOpen(false);
                }}
              >
                <ListItemIcon>
                  <Psychology />
                </ListItemIcon>
                <ListItemText
                  primary={query}
                  secondary="Click to analyze"
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Button
            fullWidth
            variant="contained"
            startIcon={<Download />}
            onClick={() => {
              if (canvas) {
                const dataURL = canvas.toDataURL({ format: 'png', quality: 1.0 });
                const link = document.createElement('a');
                link.download = 'cultural-design.png';
                link.href = dataURL;
                link.click();
              }
              setSidebarOpen(false);
            }}
            sx={{ mb: 1 }}
          >
            Export Design
          </Button>
        </Box>
      </Drawer>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdvancedDesignEditor;