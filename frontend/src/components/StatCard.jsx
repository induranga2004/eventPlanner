import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

export default function StatCard({ title, value, subtitle, icon, color = 'primary', onClick }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <MotionPaper
      elevation={0}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      whileTap={{ scale: 0.98 }}
      sx={{
        background: 'linear-gradient(135deg, #1A4870 0%, rgba(26, 72, 112, 0.9) 100%)',
        borderRadius: '16px',
        padding: '24px',
        height: '100%',
        border: '1px solid rgba(91, 153, 194, 0.2)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(91, 153, 194, 0.1) 0%, transparent 50%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover::before': {
          opacity: 1,
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        {icon && (
          <MotionBox
            whileHover={{ 
              scale: 1.1, 
              rotate: 5,
              transition: { type: 'spring', stiffness: 400, damping: 15 }
            }}
            sx={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(91, 153, 194, 0.3) 0%, rgba(91, 153, 194, 0.15) 100%)',
              border: '1px solid rgba(91, 153, 194, 0.4)',
              boxShadow: '0 4px 12px rgba(91, 153, 194, 0.2)',
              color: '#F9DBBA',
              fontSize: '24px',
            }}
          >
            {icon}
          </MotionBox>
        )}
        <Box flex={1}>
          <Typography 
            variant="overline" 
            sx={{ 
              color: 'rgba(249, 219, 186, 0.85)', 
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
            }}
          >
            {title}
          </Typography>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#F9DBBA',
                fontWeight: 700,
                lineHeight: 1.2,
                my: 0.5,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              {value}
            </Typography>
          </motion.div>
          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(249, 219, 186, 0.75)',
                fontWeight: 500,
                fontSize: '0.85rem',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Animated accent line */}
      <MotionBox
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #5B99C2 0%, rgba(91, 153, 194, 0.3) 100%)',
          transformOrigin: 'left',
        }}
      />
    </MotionPaper>
  );
}



