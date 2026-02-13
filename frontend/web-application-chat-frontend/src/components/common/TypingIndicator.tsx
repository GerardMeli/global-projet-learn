// src/components/TypingIndicator.tsx
import React from 'react';
import { Box, Typography, Fade, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FiberManualRecord as FiberManualRecordIcon } from '@mui/icons-material';

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-12px) scale(1.2);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.6;
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
    boxShadow: 0 0 0 6px rgba(76, 175, 80, 0);
  }
  100% {
    transform: scale(1);
    opacity: 0.6;
    boxShadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
`;

const TypingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2.5),
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)',
  backdropFilter: 'blur(15px)',
  borderRadius: '28px',
  maxWidth: 'fit-content',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.15)',
  animation: 'float 3s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-3px)' },
  }
}));

const Dot = styled(Box)(({ theme }) => ({
  width: 9,
  height: 9,
  borderRadius: '50%',
  margin: '0 3px',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    animation: `${bounce} 1.4s infinite ease-in-out`,
  },
  
  '&:nth-of-type(1)::before': {
    animationDelay: '-0.32s',
  },
  
  '&:nth-of-type(2)::before': {
    animationDelay: '-0.16s',
  },
  
  '&:nth-of-type(3)::before': {
    animationDelay: '0s',
  },
}));

const UserPulse = styled(Box)(({ theme }) => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
  marginRight: 8,
  animation: `${pulse} 1.5s infinite ease-in-out`,
}));

interface TypingIndicatorProps {
  isTyping: boolean;
  userName?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTyping, userName }) => {
  if (!isTyping) return null;

  return (
    <Fade in={isTyping} timeout={500}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          mb: 3,
          px: 1,
          animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '@keyframes slideIn': {
            from: {
              opacity: 0,
              transform: 'translateX(-30px)',
            },
            to: {
              opacity: 1,
              transform: 'translateX(0)',
            }
          }
        }}
      >
        <TypingContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            {userName && (
              <>
                <UserPulse />
                <FiberManualRecordIcon 
                  sx={{ 
                    fontSize: 10, 
                    color: '#4caf50',
                    filter: 'drop-shadow(0 0 6px rgba(76, 175, 80, 0.5))',
                    mr: 1,
                  }} 
                />
              </>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', mr: userName ? 2.5 : 0 }}>
            <Dot />
            <Dot />
            <Dot />
          </Box>
          
          {userName && (
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 700,
                color: '#333',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {userName} écrit...
            </Typography>
          )}
        </TypingContainer>
      </Box>
    </Fade>
  );
};

export default TypingIndicator;