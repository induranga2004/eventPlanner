import * as React from 'react'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function StatCard({ title, value, subtitle, icon, color = 'primary', onClick }) {
  return (
    <Paper
      elevation={2}
      onClick={onClick}
      sx={{
        p: 3,
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
        '&:hover': { transform: onClick ? 'translateY(-2px)' : 'none', boxShadow: 6 },
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        {icon && (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => theme.palette[color]?.light || theme.palette.grey[200],
              color: (theme) => theme.palette[color]?.main || theme.palette.text.secondary,
            }}
          >
            {icon}
          </Box>
        )}
        <Box flex={1}>
          <Typography variant="overline" color="text.secondary">{title}</Typography>
          <Typography variant="h4" sx={{ lineHeight: 1.2 }}>{value}</Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
          )}
        </Box>
      </Box>
    </Paper>
  )
}



