import React, { useEffect, useRef, useState } from 'react';
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
  Button
} from '@mui/material';
import {
  TextFields,
  Download,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong
} from '@mui/icons-material';

const SimpleCanvas = ({ 
  width = 800, 
  height = 600, 
  onCanvasReady,
  intelligenceData = null 
}) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [fabricReady, setFabricReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize Fabric.js canvas
  useEffect(() => {
    let mounted = true;
    let cleanup = null;

    const initCanvas = async () => {
      try {
        setLoading(true);
        console.log('Initializing Fabric.js canvas...');
        
        // Import fabric
        const { fabric } = await import('fabric');
        console.log('Fabric.js imported successfully');
        
        if (!mounted || !canvasRef.current) return;

        // Create canvas
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
          width: width,
          height: height,
          backgroundColor: '#ffffff',
          selection: true
        });

        console.log('Fabric canvas created');

        // Add welcome text immediately
        const welcomeText = new fabric.Text('🧠 Cultural Design Canvas Ready!', {
          left: width / 2,
          top: height / 3,
          fontSize: 24,
          fill: '#2E8B57',
          fontFamily: 'Inter',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        });
        fabricCanvas.add(welcomeText);

        // Add cultural intelligence text if available
        if (intelligenceData?.original_query) {
          const queryText = new fabric.Text(intelligenceData.original_query, {
            left: width / 2,
            top: height / 2,
            fontSize: 20,
            fill: '#333333',
            fontFamily: 'Inter',
            textAlign: 'center',
            originX: 'center',
            originY: 'center'
          });
          fabricCanvas.add(queryText);

          const infoText = new fabric.Text('🎨 Click "Add Cultural Text" to add more content', {
            left: width / 2,
            top: height / 2 + 60,
            fontSize: 14,
            fill: '#666666',
            fontFamily: 'Inter',
            textAlign: 'center',
            originX: 'center',
            originY: 'center'
          });
          fabricCanvas.add(infoText);
        } else {
          const instructionText = new fabric.Text('Click "Add Cultural Text" to start designing', {
            left: width / 2,
            top: height / 2 + 40,
            fontSize: 16,
            fill: '#666666',
            fontFamily: 'Inter',
            textAlign: 'center',
            originX: 'center',
            originY: 'center'
          });
          fabricCanvas.add(instructionText);
        }

        fabricCanvas.renderAll();
        console.log('Initial content added to canvas');

        setCanvas(fabricCanvas);
        setFabricReady(true);
        setLoading(false);

        if (onCanvasReady) {
          onCanvasReady(fabricCanvas);
        }

        // Cleanup function
        cleanup = () => {
          console.log('Disposing fabric canvas');
          fabricCanvas.dispose();
        };

      } catch (error) {
        console.error('Failed to initialize canvas:', error);
        setLoading(false);
      }
    };

    if (!canvas) {
      initCanvas();
    }

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, [width, height, intelligenceData, onCanvasReady]);

  const addText = async () => {
    if (!canvas) return;
    
    try {
      const { fabric } = await import('fabric');
      
      let content = 'New Text';
      let color = '#000000';
      
      // Use cultural intelligence for smart suggestions
      if (intelligenceData?.cultural_analysis) {
        if (intelligenceData.original_query) {
          content = intelligenceData.original_query;
        }
        if (intelligenceData.cultural_analysis.design_strategy?.color_palette?.primary_colors?.[0]) {
          color = intelligenceData.cultural_analysis.design_strategy.color_palette.primary_colors[0];
        }
      }

      const text = new fabric.Text(content, {
        left: Math.random() * (width - 200),
        top: Math.random() * (height - 100),
        fontSize: 20,
        fill: color,
        fontFamily: 'Inter'
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
    } catch (error) {
      console.error('Error adding text:', error);
    }
  };

  const exportImage = () => {
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1.0
    });
    
    const link = document.createElement('a');
    link.download = 'cultural-design.png';
    link.href = dataURL;
    link.click();
  };

  const zoomIn = () => {
    if (canvas) {
      const zoom = canvas.getZoom();
      canvas.setZoom(Math.min(zoom * 1.1, 3));
    }
  };

  const zoomOut = () => {
    if (canvas) {
      const zoom = canvas.getZoom();
      canvas.setZoom(Math.max(zoom * 0.9, 0.1));
    }
  };

  const resetZoom = () => {
    if (canvas) {
      canvas.setZoom(1);
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    }
  };

  const forceReload = () => {
    setLoading(true);
    setFabricReady(false);
    if (canvas) {
      canvas.dispose();
      setCanvas(null);
    }
    // Component will reinitialize due to useEffect dependency
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            🎨 Initializing Canvas...
          </Alert>
          <Typography variant="caption" color="textSecondary">
            Loading Fabric.js and preparing cultural design tools
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (!fabricReady || !canvas) {
    return (
      <Paper elevation={3} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            ⚠️ Canvas Not Ready
          </Alert>
          <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
            Canvas: {canvas ? 'Created' : 'Not Created'} | 
            Fabric Ready: {fabricReady ? 'Yes' : 'No'}
          </Typography>
          <Button variant="outlined" onClick={forceReload} size="small">
            🔄 Reload Canvas
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Toolbar variant="dense" sx={{ backgroundColor: 'grey.100', minHeight: '48px !important' }}>
        <Typography variant="h6" sx={{ mr: 2, fontSize: '1rem' }}>
          🧠 Cultural Canvas
        </Typography>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Tools */}
        <ButtonGroup size="small" sx={{ mr: 2 }}>
          <Tooltip title="Add Cultural Text">
            <IconButton onClick={addText} size="small">
              <TextFields />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Zoom Controls */}
        <ButtonGroup size="small" sx={{ mr: 2 }}>
          <Tooltip title="Zoom In">
            <IconButton onClick={zoomIn} size="small">
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={zoomOut} size="small">
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom">
            <IconButton onClick={resetZoom} size="small">
              <CenterFocusStrong />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Box sx={{ flexGrow: 1 }} />

        {/* Export */}
        <Tooltip title="Export PNG">
          <IconButton onClick={exportImage} size="small">
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
          p: 2
        }}
      >
        <Box
          sx={{
            border: '1px solid #ddd',
            borderRadius: 1,
            boxShadow: 2,
            backgroundColor: 'white'
          }}
        >
          <canvas ref={canvasRef} />
        </Box>
      </Box>

      {/* Status Bar */}
      {intelligenceData && (
        <Box sx={{ 
          p: 1, 
          backgroundColor: 'success.light', 
          color: 'success.contrastText',
          fontSize: '0.75rem'
        }}>
          <Typography variant="caption">
            🧠 Cultural Intelligence Active • Query: "{intelligenceData.original_query}" • 
            Confidence: {Math.round((intelligenceData.cultural_analysis?.confidence_score || 0) * 100)}%
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default SimpleCanvas;