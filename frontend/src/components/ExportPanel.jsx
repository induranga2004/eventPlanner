import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Download,
  Image,
  PictureAsPdf,
  Code,
  Share,
  Print,
  PhotoSizeSelectActual
} from '@mui/icons-material';

const EXPORT_FORMATS = {
  PNG: { 
    label: 'PNG', 
    icon: <Image />, 
    description: 'High-quality raster image',
    extensions: ['.png']
  },
  JPEG: { 
    label: 'JPEG', 
    icon: <Image />, 
    description: 'Compressed image format',
    extensions: ['.jpg', '.jpeg']
  },
  SVG: { 
    label: 'SVG', 
    icon: <Code />, 
    description: 'Scalable vector graphics',
    extensions: ['.svg']
  },
  PDF: { 
    label: 'PDF', 
    icon: <PictureAsPdf />, 
    description: 'Print-ready document',
    extensions: ['.pdf']
  }
};

const SOCIAL_MEDIA_PRESETS = {
  'facebook-post': { name: 'Facebook Post', width: 1200, height: 630, category: 'Social Media' },
  'facebook-cover': { name: 'Facebook Cover', width: 1640, height: 859, category: 'Social Media' },
  'instagram-post': { name: 'Instagram Post', width: 1080, height: 1080, category: 'Social Media' },
  'instagram-story': { name: 'Instagram Story', width: 1080, height: 1920, category: 'Social Media' },
  'twitter-post': { name: 'Twitter Post', width: 1200, height: 675, category: 'Social Media' },
  'linkedin-post': { name: 'LinkedIn Post', width: 1200, height: 627, category: 'Social Media' },
  'youtube-thumbnail': { name: 'YouTube Thumbnail', width: 1280, height: 720, category: 'Video' },
  'a4-portrait': { name: 'A4 Portrait', width: 2480, height: 3508, category: 'Print', dpi: 300 },
  'a4-landscape': { name: 'A4 Landscape', width: 3508, height: 2480, category: 'Print', dpi: 300 },
  'poster-small': { name: 'Small Poster', width: 2550, height: 3300, category: 'Print', dpi: 300 },
  'poster-large': { name: 'Large Poster', width: 5100, height: 6600, category: 'Print', dpi: 300 }
};

const QUALITY_PRESETS = {
  web: { label: 'Web Optimized', quality: 0.8, dpi: 72 },
  print: { label: 'Print Quality', quality: 1.0, dpi: 300 },
  high: { label: 'High Resolution', quality: 1.0, dpi: 300 }
};

const ExportPanel = ({ canvas, onExport }) => {
  const [selectedFormat, setSelectedFormat] = useState('PNG');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [quality, setQuality] = useState(0.9);
  const [customDimensions, setCustomDimensions] = useState({ width: 1080, height: 1080 });
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  const handleExport = async (format, preset = null) => {
    if (!canvas) {
      setExportStatus({ type: 'error', message: 'Canvas not available' });
      return;
    }

    setIsExporting(true);
    setExportStatus({ type: 'info', message: 'Preparing export...' });

    try {
      let exportDimensions = customDimensions;
      
      if (preset && SOCIAL_MEDIA_PRESETS[preset]) {
        exportDimensions = {
          width: SOCIAL_MEDIA_PRESETS[preset].width,
          height: SOCIAL_MEDIA_PRESETS[preset].height
        };
      }

      // Store original canvas dimensions
      const originalWidth = canvas.getWidth();
      const originalHeight = canvas.getHeight();
      const originalZoom = canvas.getZoom();

      // Calculate scale factor
      const scaleX = exportDimensions.width / originalWidth;
      const scaleY = exportDimensions.height / originalHeight;
      const scale = Math.min(scaleX, scaleY);

      // Temporarily resize canvas for export
      canvas.setDimensions({
        width: exportDimensions.width,
        height: exportDimensions.height
      });
      canvas.setZoom(scale * originalZoom);
      canvas.renderAll();

      let dataURL;
      let fileName = `design_${Date.now()}`;

      switch (format) {
        case 'PNG':
          dataURL = canvas.toDataURL({
            format: 'png',
            quality: quality,
            multiplier: quality >= 1 ? 2 : 1
          });
          fileName += '.png';
          break;

        case 'JPEG':
          dataURL = canvas.toDataURL({
            format: 'jpeg',
            quality: quality,
            multiplier: quality >= 1 ? 2 : 1
          });
          fileName += '.jpg';
          break;

        case 'SVG':
          const svgString = canvas.toSVG({
            width: exportDimensions.width,
            height: exportDimensions.height,
            viewBox: {
              x: 0,
              y: 0,
              width: exportDimensions.width,
              height: exportDimensions.height
            }
          });
          dataURL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
          fileName += '.svg';
          break;

        case 'PDF':
          // For PDF, we'll use jsPDF
          const { default: jsPDF } = await import('jspdf');
          const imgData = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2
          });
          
          const pdf = new jsPDF({
            orientation: exportDimensions.width > exportDimensions.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [exportDimensions.width, exportDimensions.height]
          });
          
          pdf.addImage(imgData, 'PNG', 0, 0, exportDimensions.width, exportDimensions.height);
          pdf.save(fileName.replace('.png', '.pdf'));
          
          // Restore canvas
          canvas.setDimensions({ width: originalWidth, height: originalHeight });
          canvas.setZoom(originalZoom);
          canvas.renderAll();
          
          setExportStatus({ type: 'success', message: 'PDF exported successfully!' });
          setIsExporting(false);
          return;
      }

      // Download the file
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Restore canvas dimensions
      canvas.setDimensions({ width: originalWidth, height: originalHeight });
      canvas.setZoom(originalZoom);
      canvas.renderAll();

      setExportStatus({ type: 'success', message: `${format} exported successfully!` });
      
      if (onExport) {
        onExport({ format, dimensions: exportDimensions, quality });
      }

    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({ type: 'error', message: 'Export failed. Please try again.' });
    }

    setIsExporting(false);
  };

  const handleBatchExport = async () => {
    const formats = ['PNG', 'JPEG', 'PDF'];
    setExportStatus({ type: 'info', message: 'Starting batch export...' });
    
    for (const format of formats) {
      await handleExport(format, selectedPreset);
      // Small delay between exports
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setExportStatus({ type: 'success', message: 'Batch export completed!' });
  };

  const presetsByCategory = Object.entries(SOCIAL_MEDIA_PRESETS).reduce((acc, [key, preset]) => {
    if (!acc[preset.category]) acc[preset.category] = [];
    acc[preset.category].push({ key, ...preset });
    return acc;
  }, {});

  return (
    <Card sx={{ height: 'fit-content' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🎨 Export & Download
        </Typography>

        {exportStatus && (
          <Alert severity={exportStatus.type} sx={{ mb: 2 }}>
            {exportStatus.message}
          </Alert>
        )}

        {/* Format Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Export Format
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(EXPORT_FORMATS).map(([key, format]) => (
              <Grid item xs={6} sm={3} key={key}>
                <Button
                  variant={selectedFormat === key ? "contained" : "outlined"}
                  fullWidth
                  startIcon={format.icon}
                  onClick={() => setSelectedFormat(key)}
                  size="small"
                >
                  {format.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Preset Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Size Presets
          </Typography>
          
          {Object.entries(presetsByCategory).map(([category, presets]) => (
            <Box key={category} sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {category}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {presets.map((preset) => (
                  <Chip
                    key={preset.key}
                    label={`${preset.name} (${preset.width}×${preset.height})`}
                    variant={selectedPreset === preset.key ? "filled" : "outlined"}
                    color={selectedPreset === preset.key ? "primary" : "default"}
                    size="small"
                    onClick={() => setSelectedPreset(preset.key)}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Quality Settings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Export Quality: {Math.round(quality * 100)}%
          </Typography>
          <Slider
            value={quality}
            min={0.1}
            max={1.0}
            step={0.1}
            onChange={(_, value) => setQuality(value)}
            marks={[
              { value: 0.3, label: 'Web' },
              { value: 0.8, label: 'High' },
              { value: 1.0, label: 'Max' }
            ]}
          />
        </Box>

        {/* Export Buttons */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              startIcon={isExporting ? <CircularProgress size={20} /> : <Download />}
              onClick={() => handleExport(selectedFormat, selectedPreset)}
              disabled={isExporting}
              size="large"
            >
              {isExporting ? 'Exporting...' : `Export as ${selectedFormat}`}
            </Button>
          </Grid>
          
          <Grid item xs={6}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Share />}
              onClick={handleBatchExport}
              disabled={isExporting}
              size="small"
            >
              Batch Export
            </Button>
          </Grid>
          
          <Grid item xs={6}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Print />}
              onClick={() => handleExport('PDF', 'a4-portrait')}
              disabled={isExporting}
              size="small"
            >
              Print Ready
            </Button>
          </Grid>
        </Grid>

        {/* Cultural Context Info */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            💡 <strong>Cultural Design Tip:</strong> For Sri Lankan political content, use high-resolution exports (300 DPI) for print materials like posters and banners. Social media formats are optimized for web viewing.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExportPanel;