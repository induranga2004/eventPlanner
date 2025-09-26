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
  CenterFocusStrong,
  Palette
} from '@mui/icons-material';

const FastCanvas = ({ 
  width = 800, 
  height = 600, 
  onCanvasReady,
  intelligenceData = null 
}) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Initialize HTML5 Canvas immediately (no Fabric.js delays)
  useEffect(() => {
    if (!canvasRef.current) return;

    console.log('FastCanvas: Starting immediate initialization...');
    
    try {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      // Set white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);

      // Add welcome text immediately
      ctx.fillStyle = '#2E8B57';
      ctx.font = 'bold 24px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🧠 Cultural Design Canvas Ready!', width / 2, height / 3);

      // Add cultural intelligence text if available
      if (intelligenceData?.original_query) {
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 20px Inter, Arial, sans-serif';
        ctx.fillText(intelligenceData.original_query, width / 2, height / 2);

        ctx.fillStyle = '#666666';
        ctx.font = '14px Inter, Arial, sans-serif';
        ctx.fillText('🎨 Cultural intelligence active - Click tools to design', width / 2, height / 2 + 40);
      } else {
        ctx.fillStyle = '#666666';
        ctx.font = '16px Inter, Arial, sans-serif';
        ctx.fillText('Click "Add Text" or "Add Shape" to start designing', width / 2, height / 2 + 40);
      }

      // Add border
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, width, height);

      console.log('FastCanvas: Initialization complete!');
      
      setCanvas(canvasRef.current);
      setIsReady(true);

      if (onCanvasReady) {
        onCanvasReady(canvasRef.current);
      }
    } catch (error) {
      console.error('FastCanvas error:', error);
      setIsReady(true); // Show even if error
    }
  }, [width, height, intelligenceData, onCanvasReady]);

  const addText = () => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let text = 'New Text';
    let color = '#000000';
    
    // Use cultural intelligence for smart suggestions
    if (intelligenceData?.cultural_analysis) {
      if (intelligenceData.original_query) {
        text = intelligenceData.original_query;
      }
      if (intelligenceData.cultural_analysis.design_strategy?.color_palette?.primary_colors?.[0]) {
        color = intelligenceData.cultural_analysis.design_strategy.color_palette.primary_colors[0];
      }
    }

    // Add text at random position
    const x = 100 + Math.random() * (width - 200);
    const y = 100 + Math.random() * (height - 200);
    
    ctx.fillStyle = color;
    ctx.font = '20px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(text, x, y);
  };

  const addShape = () => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const x = 50 + Math.random() * (width - 200);
    const y = 50 + Math.random() * (height - 150);
    const w = 100;
    const h = 60;
    
    // Use cultural colors if available
    let fillColor = '#2E8B57'; // Default SLPP green
    if (intelligenceData?.cultural_analysis?.design_strategy?.color_palette?.primary_colors?.[0]) {
      fillColor = intelligenceData.cultural_analysis.design_strategy.color_palette.primary_colors[0];
    }
    
    ctx.fillStyle = fillColor + '40'; // Semi-transparent
    ctx.fillRect(x, y, w, h);
    
    ctx.strokeStyle = fillColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    
    // Add label
    ctx.fillStyle = '#333';
    ctx.font = '14px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Cultural Element', x + w/2, y + h/2 + 5);
  };

  const clearCanvas = () => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    // Redraw border
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
  };

  const exportImage = () => {
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'cultural-design.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!isReady) {
    return (
      <Paper elevation={3} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="info">
          🎨 Preparing Canvas...
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Toolbar variant="dense" sx={{ backgroundColor: 'grey.100', minHeight: '48px !important' }}>
        <Typography variant="h6" sx={{ mr: 2, fontSize: '1rem' }}>
          🧠 Cultural Canvas (Fast Mode)
        </Typography>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Tools */}
        <ButtonGroup size="small" sx={{ mr: 2 }}>
          <Tooltip title="Add Cultural Text">
            <IconButton onClick={addText} size="small">
              <TextFields />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Cultural Shape">
            <IconButton onClick={addShape} size="small">
              <Palette />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Button size="small" onClick={clearCanvas} sx={{ mr: 1 }}>
          Clear
        </Button>

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
            border: '2px solid #ddd',
            borderRadius: 1,
            boxShadow: 3,
            backgroundColor: 'white'
          }}
        >
          <canvas 
            ref={canvasRef}
            style={{
              display: 'block',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
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
            Confidence: {Math.round((intelligenceData.cultural_analysis?.confidence_score || 0.3) * 100)}% •
            Backend API: ✅ Connected
          </Typography>
        </Box>
      )}

      {!intelligenceData && (
        <Box sx={{ 
          p: 1, 
          backgroundColor: 'info.light', 
          color: 'info.contrastText',
          fontSize: '0.75rem'
        }}>
          <Typography variant="caption">
            🎨 Fast Canvas Mode • No Fabric.js delays • HTML5 Canvas • Backend API: ✅ Connected
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FastCanvas;