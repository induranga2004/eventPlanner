import React from 'react';
import { Chip, Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import DiamondIcon from '@mui/icons-material/Diamond';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

// Premium glow animation
const premiumGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3); 
  }
  50% { 
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.5); 
  }
`;

// Styled Pro Badge
const StyledProBadge = styled(Chip)(({ variant, size }) => ({
  background: variant === 'premium' 
    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: variant === 'premium' ? '#000' : '#fff',
  fontWeight: 'bold',
  fontSize: size === 'large' ? '14px' : size === 'medium' ? '12px' : '10px',
  padding: size === 'large' ? '8px 12px' : size === 'medium' ? '4px 8px' : '2px 6px',
  animation: variant === 'premium' ? `${premiumGlow} 2s ease-in-out infinite` : 'none',
  border: variant === 'premium' ? '2px solid rgba(255, 215, 0, 0.3)' : '1px solid rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(10px)',
  '& .MuiChip-icon': {
    color: variant === 'premium' ? '#000' : '#fff',
    fontSize: size === 'large' ? '18px' : size === 'medium' ? '16px' : '14px'
  },
  '&:hover': {
    transform: 'scale(1.05)',
    transition: 'transform 0.2s ease'
  }
}));

// Floating Pro Badge for absolute positioning
const FloatingProBadge = styled(Box)(({ position }) => ({
  position: 'absolute',
  top: position?.top || '8px',
  right: position?.right || '8px',
  left: position?.left,
  bottom: position?.bottom,
  zIndex: 10,
  transform: position?.transform || 'none'
}));

const ProBadge = ({ 
  variant = 'pro', // 'pro' | 'premium'
  size = 'small', // 'small' | 'medium' | 'large'
  position = 'inline', // 'inline' | 'floating' | custom position object
  showIcon = true,
  label,
  onClick
}) => {
  // Don't render anything if variant is null/undefined and no explicit variant is set
  if (!variant) {
    return null;
  }

  const getIcon = () => {
    if (!showIcon) return null;
    
    switch (variant) {
      case 'premium':
        return <DiamondIcon />;
      case 'verified':
        return <WorkspacePremiumIcon />;
      default:
        return <StarIcon />;
    }
  };

  const getLabel = () => {
    if (label) return label;
    
    switch (variant) {
      case 'premium':
        return 'PREMIUM';
      case 'verified':
        return 'VERIFIED';
      default:
        return 'PRO';
    }
  };

  const badge = (
    <StyledProBadge
      icon={getIcon()}
      label={getLabel()}
      variant={variant}
      size={size}
      onClick={onClick}
      clickable={!!onClick}
    />
  );

  // Return floating badge if position is not inline
  if (position !== 'inline') {
    return (
      <FloatingProBadge position={typeof position === 'object' ? position : undefined}>
        {badge}
      </FloatingProBadge>
    );
  }

  return badge;
};

export default ProBadge;