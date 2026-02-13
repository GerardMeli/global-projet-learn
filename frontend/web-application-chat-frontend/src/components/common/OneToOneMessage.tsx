// src/components/ChatMessage.tsx
import React from 'react';
import { Box, Typography, Paper, Avatar, Tooltip, Fade, alpha } from '@mui/material';
import {
  DoneAll as DoneAllIcon,
  Done as DoneIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import type { PrivateChatMessage } from '../../types/oneToOne.type';

interface ChatMessageProps {
  message: PrivateChatMessage;
  currentUserId: number;
  showDateSeparator?: boolean;
  dateLabel?: string;
}

const OneToOneMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  currentUserId,
  showDateSeparator = false,
  dateLabel = ''
}) => {
  const isOwnMessage = message.senderId1 === currentUserId;
  const messageDate = new Date(message.timestamp);
  
  // Formater l'heure seule (14:30)
  const formatTime = (date: Date): string => {
    try {
      if (isNaN(date.getTime())) {
        return '--:--';
      }
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '--:--';
    }
  };

  // Formater la date et l'heure complète (pour tooltip)
  const formatDateTime = (date: Date): string => {
    try {
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return 'Date invalide';
    }
  };

  // Obtenir les initiales
  const getInitials = (name: string) => {
    if (!name) return '??';
    const nameParts = name.split(' ');
    return nameParts
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  // Obtenir une couleur d'avatar basée sur l'ID
  const getAvatarColor = (userId: number): string => {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#4ecdc4', '#45b7d1',
      '#96fbc4', '#f9d423', '#ff8a00', '#52b788', '#fd746c'
    ];
    return colors[userId % colors.length];
  };

  const ownMessageStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#FFFFFF',
    border: 'none',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
  };

  const otherMessageStyle = {
    background: '#FFFFFF',
    color: '#1D1D1F',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
  };

  return (
    <>
      {/* Date Separator */}
      {showDateSeparator && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            my: 3,
            position: 'relative',
            '&::before, &::after': {
              content: '""',
              flex: 1,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)',
            }
          }}
        >
          <Typography
            variant="caption"
            sx={{
              bgcolor: 'background.paper',
              color: 'text.secondary',
              fontWeight: 500,
              px: 2,
              py: 0.75,
              borderRadius: '12px',
              border: '1px solid rgba(0,0,0,0.06)',
              fontSize: '0.75rem',
              mx: 2,
            }}
          >
            {dateLabel}
          </Typography>
        </Box>
      )}

      <Fade in={true} timeout={400}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
            mb: 2.5,
            px: { xs: 1.5, sm: 2.5 },
            animation: 'messageSlide 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            '@keyframes messageSlide': {
              from: {
                opacity: 0,
                transform: isOwnMessage ? 'translateX(30px) scale(0.95)' : 'translateX(-30px) scale(0.95)',
              },
              to: {
                opacity: 1,
                transform: 'translateX(0) scale(1)',
              }
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: isOwnMessage ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              maxWidth: { xs: '85%', sm: '70%', md: '60%' },
              gap: 1.5,
              width: '100%',
            }}
          >
            {/* Avatar pour les messages reçus */}
            {!isOwnMessage && (
              <Tooltip 
                title={message.senderName1 || 'Utilisateur'} 
                placement="top"
                arrow
                TransitionComponent={Fade}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: getAvatarColor(message.senderId1),
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.3s ease',
                    border: '2px solid white',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                    '&:hover': {
                      transform: 'scale(1.08)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                    }
                  }}
                >
                  {getInitials(message.senderName1 || 'Utilisateur')}
                </Avatar>
              </Tooltip>
            )}
            
            {/* Message container */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                flex: 1,
                minWidth: 0,
              }}
            >
              {/* Nom de l'expéditeur (seulement pour les messages reçus) */}
              {!isOwnMessage && (
                <Typography
                  variant="caption"
                  sx={{
                    color: getAvatarColor(message.senderId1),
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    mb: 0.75,
                    ml: 1.5,
                    letterSpacing: '0.3px',
                  }}
                >
                  {message.senderName1 || 'Utilisateur'}
                </Typography>
              )}
              
              {/* Message bubble */}
              <Box
                sx={{
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    [isOwnMessage ? 'right' : 'left']: -4,
                    width: 8,
                    height: 8,
                    background: isOwnMessage 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : '#FFFFFF',
                    clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                    transform: isOwnMessage ? 'rotate(-45deg)' : 'rotate(45deg)',
                    display: { xs: 'none', sm: 'block' },
                  }
                }}
              >
                <Tooltip 
                  title={formatDateTime(messageDate)} 
                  placement="top"
                  arrow
                  TransitionComponent={Fade}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: isOwnMessage 
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px',
                      ...(isOwnMessage ? ownMessageStyle : otherMessageStyle),
                      position: 'relative',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: isOwnMessage
                          ? '0 6px 24px rgba(102, 126, 234, 0.2)'
                          : '0 4px 20px rgba(0, 0, 0, 0.08)',
                      },
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%',
                    }}
                  >
                    {/* Contenu du message */}
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        wordBreak: 'break-word',
                        lineHeight: 1.6,
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        fontWeight: 400,
                        color: 'inherit',
                        whiteSpace: 'pre-wrap',
                        letterSpacing: '0.2px',
                      }}
                    >
                      {message.content}
                    </Typography>
                    
                    {/* Métadonnées du message */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        mt: 1.25,
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.7rem',
                          color: isOwnMessage ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.45)',
                          fontWeight: 500,
                          letterSpacing: '0.3px',
                        }}
                      >
                        {formatTime(messageDate)}
                      </Typography>
                      
                      {/* Status icons pour vos propres messages */}
                      {isOwnMessage && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          ml: 0.5 
                        }}>
                          {message.isRead ? (
                            <Tooltip title="Lu" arrow TransitionComponent={Fade}>
                              <DoneAllIcon 
                                sx={{ 
                                  fontSize: 15, 
                                  color: 'rgba(255,255,255,0.95)',
                                }} 
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Envoyé" arrow TransitionComponent={Fade}>
                              <DoneIcon 
                                sx={{ 
                                  fontSize: 15, 
                                  color: 'rgba(255,255,255,0.7)',
                                }} 
                              />
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Tooltip>
              </Box>
            </Box>
            
            {/* Avatar pour vos propres messages */}
            {isOwnMessage && (
              <Tooltip 
                title="Vous" 
                placement="top"
                arrow
                TransitionComponent={Fade}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: getAvatarColor(currentUserId),
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.3s ease',
                    border: '2px solid white',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                    '&:hover': {
                      transform: 'scale(1.08)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                    }
                  }}
                >
                  {getInitials(message.senderName1 || 'Moi')}
                </Avatar>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Fade>
    </>
  );
};

export default OneToOneMessage;