import React, { useEffect, useState } from 'react'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function StatCard({ title, value, subtitle, icon, color = 'primary', onClick }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <Paper
      elevation={2}
      onClick={onClick}
      style={{
        transition: 'transform 220ms cubic-bezier(.2,.8,.2,1), box-shadow 220ms, opacity 300ms',
        transform: mounted ? 'translateY(0)' : 'translateY(6px)',
        opacity: mounted ? 1 : 0,
        cursor: onClick ? 'pointer' : 'default',
      }}
      sx={{ p: 3, height: '100%', '&:hover': { boxShadow: 6, transform: onClick ? 'translateY(-4px)' : undefined } }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        {icon && (
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => `linear-gradient(135deg, ${theme.palette[color]?.light || theme.palette.grey[200]} 0%, ${theme.palette[color]?.main || theme.palette.grey[300]} 100%)`,
              color: (theme) => theme.palette.getContrastText(theme.palette[color]?.main || theme.palette.grey[300]),
              boxShadow: (theme) => `0 6px 18px ${theme.palette[color]?.main ? theme.palette[color].main + '20' : '#00000020'}`,
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



