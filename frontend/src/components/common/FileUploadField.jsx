import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

const FileUploadField = ({ name, label, helperText, accept = '*', required = false, fullWidth = true }) => {
  const inputRef = React.useRef(null);
  const [fileName, setFileName] = React.useState('');

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : '');
  };

  return (
    <Stack spacing={1.25}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body1" fontWeight={600}>
          {label}
          {required && <Typography component="span" color="error.main"> *</Typography>}
        </Typography>
        {fileName && <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />}
      </Stack>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        hidden
        onChange={handleChange}
      />

      <Button
        variant="outlined"
        color="inherit"
        onClick={handleClick}
        startIcon={<CloudUploadRoundedIcon />}
        sx={{
          justifyContent: 'flex-start',
          textTransform: 'none',
          ...(fullWidth && { width: '100%' }),
          borderStyle: 'dashed',
          borderColor: 'rgba(148, 163, 184, 0.4)',
        }}
      >
        {fileName ? fileName : 'Select file'}
      </Button>

      {helperText && (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      )}
    </Stack>
  );
};

export default FileUploadField;
