import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  GridOn,
  Layers,
  Palette,
  TextFields,
  Image,
  Crop,
  Save,
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
  const [showGrid, setShowGrid] = useState(true);
  const [selectedTool, setSelectedTool] = useState('select');
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Initialize Fabric.js Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: width,
      height: height,
      backgroundColor: 'white',
      selection: true,
      preserveObjectStacking: true,
    });

    // Enable high DPI rendering
    const ratio = window.devicePixelRatio || 1;
    fabricCanvas.setDimensions({
      width: width * ratio,
      height: height * ratio
    }, { cssOnly: false });
    fabricCanvas.setZoom(ratio);

    // Configure canvas properties
    fabricCanvas.enableRetinaScaling = true;
    fabricCanvas.imageSmoothingEnabled = false;

    // Add grid if enabled
    if (showGrid) {
      addGrid(fabricCanvas);
    }

    // Setup event listeners for smart features
    setupCanvasEvents(fabricCanvas);

    setCanvas(fabricCanvas);
    if (onCanvasReady) onCanvasReady(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [width, height, showGrid]);

  // Smart Grid System
  const addGrid = (canvas) => {
    const gridSize = 20;
    const gridColor = '#e0e0e0';
    
    for (let i = 0; i <= canvas.width / gridSize; i++) {
      const line = new fabric.Line([i * gridSize, 0, i * gridSize, canvas.height], {
        stroke: gridColor,
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        excludeFromExport: true
      });
      canvas.add(line);
    }

    for (let i = 0; i <= canvas.height / gridSize; i++) {
      const line = new fabric.Line([0, i * gridSize, canvas.width, i * gridSize], {
        stroke: gridColor,
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        excludeFromExport: true
      });
      canvas.add(line);
    }
  };

  // Smart Canvas Events for Cultural Design Intelligence
  const setupCanvasEvents = (canvas) => {
    // Object selection for intelligent suggestions
    canvas.on('selection:created', (e) => {
      if (intelligenceData) {
        suggestCulturalEnhancements(e.selected[0]);
      }
    });

    // Smart snapping
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      const gridSize = 20;
      
      obj.set({
        left: Math.round(obj.left / gridSize) * gridSize,
        top: Math.round(obj.top / gridSize) * gridSize
      });
    });

    // History tracking
    canvas.on('object:added', saveState);
    canvas.on('object:removed', saveState);
    canvas.on('object:modified', saveState);
  };

  // Cultural Enhancement Suggestions based on Phase 1 Intelligence
  const suggestCulturalEnhancements = (selectedObject) => {
    if (!intelligenceData?.cultural_analysis) return;

    const { cultural_analysis } = intelligenceData;
    
    // Apply cultural color palette
    if (cultural_analysis.design_strategy?.color_palette) {
      const colors = cultural_analysis.design_strategy.color_palette.primary_colors;
      if (colors && selectedObject.fill) {
        // Suggest culturally appropriate colors
        console.log('Suggesting cultural colors:', colors);
      }
    }

    // Apply cultural typography
    if (selectedObject instanceof fabric.Text && cultural_analysis.design_strategy?.typography) {
      const typography = cultural_analysis.design_strategy.typography;
      console.log('Suggesting cultural typography:', typography);
    }
  };

  // Zoom Controls
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 5);
    setZoom(newZoom);
    canvas?.setZoom(newZoom);
    canvas?.renderAll();
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
    canvas?.setZoom(newZoom);
    canvas?.renderAll();
  };

  const handleZoomFit = () => {
    if (canvas) {
      canvas.setZoom(1);
      canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
      setZoom(1);
      canvas.renderAll();
    }
  };

  // History Management
  const saveState = useCallback(() => {
    if (!canvas) return;
    
    const currentState = JSON.stringify(canvas.toJSON());
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(currentState);
    
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [canvas, history, historyStep]);

  const undo = () => {
    if (historyStep > 0) {
      const previousState = history[historyStep - 1];
      canvas.loadFromJSON(previousState, () => {
        canvas.renderAll();
        setHistoryStep(historyStep - 1);
      });
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const nextState = history[historyStep + 1];
      canvas.loadFromJSON(nextState, () => {
        canvas.renderAll();
        setHistoryStep(historyStep + 1);
      });
    }
  };

  // Smart Text Addition with Cultural Context
  const addIntelligentText = () => {
    if (!canvas) return;

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
    }

    const text = new fabric.Text(textContent, {
      left: canvas.width / 2 - 50,
      top: canvas.height / 2 - 12,
      fontFamily: fontFamily,
      fontSize: fontSize,
      fill: color,
      textAlign: 'center'
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  // Export Functions
  const exportAsImage = () => {
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 2 // High resolution
    });
    
    const link = document.createElement('a');
    link.download = 'design.png';
    link.href = dataURL;
    link.click();
  };

  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Advanced Toolbar */}
      <Toolbar variant="dense" sx={{ backgroundColor: 'grey.100', minHeight: '56px !important' }}>
        <Typography variant="h6" sx={{ mr: 2 }}>
          Cultural Design Editor
        </Typography>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        
        {/* History Controls */}
        <ButtonGroup size="small" sx={{ mr: 2 }}>
          <Tooltip title="Undo">
            <IconButton 
              onClick={undo} 
              disabled={historyStep <= 0}
              size="small"
            >
              <Undo />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton 
              onClick={redo} 
              disabled={historyStep >= history.length - 1}
              size="small"
            >
              <Redo />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

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
          <Tooltip title="Toggle Grid">
            <IconButton 
              onClick={() => setShowGrid(!showGrid)}
              color={showGrid ? 'primary' : 'default'}
              size="small"
            >
              <GridOn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Cultural Text">
            <IconButton onClick={addIntelligentText} size="small">
              <TextFields />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Box sx={{ flexGrow: 1 }} />

        {/* Export Controls */}
        <ButtonGroup size="small">
          <Tooltip title="Export as PNG">
            <IconButton onClick={exportAsImage} size="small">
              <Download />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
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
            🧠 Cultural Intelligence Active: {intelligenceData.cultural_analysis?.confidence_score * 100}% confidence
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