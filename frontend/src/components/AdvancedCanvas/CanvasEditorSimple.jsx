import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  ButtonGroup,
  Divider,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  GridOn,
  TextFields,
  Download
} from '@mui/icons-material';

const CanvasEditor = ({ 
  width = 800, 
  height = 600, 
  onCanvasReady,
  intelligenceData = null 
}) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);

  // Dynamic import of Fabric.js to avoid build issues
  useEffect(() => {
    const loadFabric = async () => {
      try {
        console.log('Starting Fabric.js initialization...');
        
        // Try different import approaches for better compatibility
        let fabric;
        try {
          // Try standard import first
          const fabricModule = await import('fabric');
          fabric = fabricModule.fabric || fabricModule.default?.fabric || fabricModule;
        } catch (importError) {
          console.warn('Standard import failed, trying alternative:', importError);
          // Fallback to window.fabric if available
          if (window.fabric) {
            fabric = window.fabric;
          } else {
            throw new Error('Fabric.js not available');
          }
        }

        if (!fabric || !fabric.Canvas) {
          throw new Error('Fabric.js Canvas not found');
        }

        console.log('Fabric.js loaded, creating canvas...');
        
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
          width: width,
          height: height,
          backgroundColor: 'white',
          selection: true,
          preserveObjectStacking: true,
        });

        console.log('Canvas created successfully');

        setCanvas(fabricCanvas);
        setFabricLoaded(true);
        setLoadingError(null);
        
        if (onCanvasReady) {
          onCanvasReady(fabricCanvas);
        }

        return () => {
          fabricCanvas.dispose();
        };
      } catch (error) {
        console.error('Failed to initialize Fabric.js canvas:', error);
        setLoadingError(`Canvas initialization failed: ${error.message}`);
        setFabricLoaded(true);
      }
    };

    if (!canvas && canvasRef.current && !fabricLoaded) {
      loadFabric();
    }
  }, [width, height, canvas, fabricLoaded, onCanvasReady]);

  // Zoom Controls
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 5);
    setZoom(newZoom);
    if (canvas) {
      canvas.setZoom(newZoom);
      canvas.renderAll();
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
    if (canvas) {
      canvas.setZoom(newZoom);
      canvas.renderAll();
    }
  };

  const handleZoomFit = () => {
    if (canvas) {
      canvas.setZoom(1);
      canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
      setZoom(1);
      canvas.renderAll();
    }
  };

  // Add intelligent text with cultural context
  const addIntelligentText = async () => {
    if (!canvas || !fabricLoaded) return;

    try {
      let fabric;
      try {
        const fabricModule = await import('fabric');
        fabric = fabricModule.fabric || fabricModule.default?.fabric || fabricModule;
      } catch (importError) {
        console.warn('Using existing fabric instance');
        fabric = window.fabric;
      }

      if (!fabric || !fabric.Text) {
        console.error('Fabric.Text not available');
        return;
      }
      
      let textContent = 'Sample Text';
      let fontFamily = 'Arial';
      let fontSize = 24;
      let color = '#000000';

      // Use intelligence data for cultural suggestions
      if (intelligenceData?.cultural_analysis) {
        const { design_strategy } = intelligenceData.cultural_analysis;
        
        if (design_strategy?.typography?.primary_font) {
          fontFamily = design_strategy.typography.primary_font;
        }
        
        if (design_strategy?.color_palette?.primary_colors?.[0]) {
          color = design_strategy.color_palette.primary_colors[0];
        }

        if (intelligenceData.original_query) {
          textContent = intelligenceData.original_query;
        }
      }

      const text = new fabric.Text(textContent, {
        left: canvas.width / 2 - 100,
        top: canvas.height / 2 - 12,
        fontFamily: fontFamily,
        fontSize: fontSize,
        fill: color,
        textAlign: 'center'
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
    } catch (error) {
      console.error('Error adding text:', error);
    }
  };

  // Export as image
  const exportAsImage = () => {
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 2
    });
    
    const link = document.createElement('a');
    link.download = 'design.png';
    link.href = dataURL;
    link.click();
  };

  if (!fabricLoaded) {
    return (
      <Paper elevation={3} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
            🎨 Loading Canvas Engine...
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Initializing Fabric.js for cultural design editing
            </Typography>
          </Alert>
        </Box>
      </Paper>
    );
  }

  if (loadingError && !canvas) {
    return (
      <Paper elevation={3} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>Canvas Engine Error</Typography>
          {loadingError}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption">
              Troubleshooting steps:
            </Typography>
            <ul style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              <li>Refresh the page</li>
              <li>Clear browser cache</li>
              <li>Check browser console for details</li>
            </ul>
          </Box>
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Toolbar variant="dense" sx={{ backgroundColor: 'grey.100', minHeight: '56px !important' }}>
        <Typography variant="h6" sx={{ mr: 2 }}>
          Cultural Design Editor
        </Typography>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Zoom Controls */}
        <ButtonGroup size="small" sx={{ mr: 2 }}>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fit to Screen">
            <IconButton onClick={handleZoomFit} size="small">
              <CenterFocusStrong />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Typography variant="caption" sx={{ mr: 2, minWidth: 60 }}>
          {Math.round(zoom * 100)}%
        </Typography>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Design Tools */}
        <ButtonGroup size="small" sx={{ mr: 2 }}>
          <Tooltip title="Add Cultural Text">
            <IconButton onClick={addIntelligentText} size="small">
              <TextFields />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Box sx={{ flexGrow: 1 }} />

        {/* Export */}
        <Tooltip title="Export as PNG">
          <IconButton onClick={exportAsImage} size="small">
            <Download />
          </IconButton>
        </Tooltip>
      </Toolbar>

      {/* Canvas Container */}
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: 'grey.50',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 1,
            boxShadow: 2,
            backgroundColor: 'white'
          }}
        >
          <canvas ref={canvasRef} />
        </Box>
      </Box>

      {/* Intelligence Status */}
      {intelligenceData && (
        <Box sx={{ p: 1, backgroundColor: 'info.light', color: 'info.contrastText' }}>
          <Typography variant="caption">
            🧠 Cultural Intelligence Active: {Math.round((intelligenceData.cultural_analysis?.confidence_score || 0) * 100)}% confidence
            {intelligenceData.cultural_analysis?.cultural_themes?.length > 0 && 
              ` • Themes: ${intelligenceData.cultural_analysis.cultural_themes.join(', ')}`
            }
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CanvasEditor;