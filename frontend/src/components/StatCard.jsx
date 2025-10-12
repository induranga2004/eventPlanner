import React, { useEffect, useState } from 'react'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { styled, keyframes } from '@mui/material/styles'

// AI-themed animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`

const pulse = keyframes`
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
`

// AI-themed StatCard
const AIStatCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  padding: '24px',
  height: '100%',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
    zIndex: -1,
  },
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    animation: `${float} 2s ease-in-out infinite`,
  }
}))

const AIIconBox = styled(Box)(({ color }) => ({
  width: '56px',
  height: '56px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
  border: '1px solid rgba(255,255,255,0.3)',
  backdropFilter: 'blur(10px)',
  animation: `${pulse} 3s ease-in-out infinite`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  }
}))

const GradientText = styled(Typography)(({ variant }) => ({
  background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: variant === 'h4' ? 700 : 500,
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
}))

export default function StatCard({ title, value, subtitle, icon, color = 'primary', onClick }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <AIStatCard
      elevation={0}
      onClick={onClick}
      style={{
        transform: mounted ? 'translateY(0)' : 'translateY(6px)',
        opacity: mounted ? 1 : 0,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        {icon && (
          <AIIconBox color={color}>
            <Box sx={{ color: '#fff', fontSize: '24px' }}>
              {icon}
            </Box>
          </AIIconBox>
        )}
        <Box flex={1}>
          <Typography 
            variant="overline" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Typography>
          <GradientText variant="h4" sx={{ lineHeight: 1.2, my: 0.5 }}>
            {value}
          </GradientText>
          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 500,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </AIStatCard>
  )
}



