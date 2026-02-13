// src/components/MessageInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  InputAdornment,
  Tooltip,
  Alert,
  Typography,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  CloudOff as CloudOffIcon,
} from '@mui/icons-material';
import type { MessageRequest } from '../../types/oneToOne.type';

interface MessageInputProps {
  onSendMessage: (request: MessageRequest) => void;
  receiverId: number;
  currentUserId: number;
  onTyping?: (isTyping: boolean) => void;
  webSocketConnected?: boolean;
}

const OneToOneMessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  receiverId,
  onTyping,
  webSocketConnected = true,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDisconnectedWarning, setShowDisconnectedWarning] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const handleTyping = () => {
    if (!webSocketConnected) {
      setShowDisconnectedWarning(true);
      setTimeout(() => setShowDisconnectedWarning(false), 3000);
      return;
    }

    if (!isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping?.(false);
    }, 1000);
  };

  const handleSend = () => {
    if (!webSocketConnected) {
      setShowDisconnectedWarning(true);
      setTimeout(() => setShowDisconnectedWarning(false), 3000);
      return;
    }

    if (message.trim()) {
      const request: MessageRequest = {
        senderId2: receiverId,
        content: message.trim(),
      };
      onSendMessage(request);
      setMessage('');
      
      if (isTyping) {
        setIsTyping(false);
        onTyping?.(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Avertissement de déconnexion */}
      {showDisconnectedWarning && (
        <Alert 
          severity="warning" 
          icon={<CloudOffIcon />}
          sx={{ 
            mx: 2, 
            mb: 1,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            py: 0.5,
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 193, 7, 0.2)',
            animation: 'slideDown 0.3s ease-out',
            '@keyframes slideDown': {
              from: { opacity: 0, transform: 'translateY(-10px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            }
          }}
        >
          Impossible d'envoyer des messages : connexion WebSocket perdue
        </Alert>
      )}
      
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          background: webSocketConnected 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(245, 245, 245, 0.8) 0%, rgba(238, 238, 238, 0.8) 100%)',
          backdropFilter: 'blur(10px)',
          opacity: webSocketConnected ? 1 : 0.7,
          transition: 'all 0.3s ease',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip 
            title={webSocketConnected ? "Joindre un fichier" : "Non disponible - WebSocket déconnecté"}
            arrow
          >
            <span>
              <IconButton 
                color="primary" 
                disabled={!webSocketConnected}
                sx={{
                  background: webSocketConnected 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                    : 'rgba(158, 158, 158, 0.1)',
                  color: webSocketConnected ? '#667eea' : '#9e9e9e',
                  '&:hover': webSocketConnected ? {
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                    transform: 'scale(1.1)',
                  } : {},
                  transition: 'all 0.2s ease',
                  marginRight: 1,
                }}
              >
                <AttachFileIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder={
              webSocketConnected 
                ? "Tapez votre message..." 
                : "En attente de reconnexion..."
            }
            variant="outlined"
            size="small"
            disabled={!webSocketConnected}
            sx={{
              mx: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 24,
                background: webSocketConnected 
                  ? 'rgba(255, 255, 255, 0.9)'
                  : 'rgba(245, 245, 245, 0.9)',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.2)',
                  borderColor: '#667eea',
                },
                '&.Mui-disabled': {
                  background: 'rgba(245, 245, 245, 0.7)',
                },
              },
              '& .MuiOutlinedInput-input': {
                fontSize: '0.95rem',
                padding: '10px 16px',
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip 
                    title={webSocketConnected ? "Émojis" : "Non disponible - WebSocket déconnecté"}
                    arrow
                  >
                    <span>
                      <IconButton 
                        color="primary" 
                        disabled={!webSocketConnected}
                        sx={{
                          background: webSocketConnected 
                            ? 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)'
                            : 'rgba(158, 158, 158, 0.1)',
                          color: webSocketConnected ? '#ff9800' : '#9e9e9e',
                          '&:hover': webSocketConnected ? {
                            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%)',
                            transform: 'scale(1.1)',
                          } : {},
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <EmojiEmotionsIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
          
          <Tooltip 
            title={
              !webSocketConnected 
                ? "En attente de reconnexion..." 
                : !message.trim() 
                ? "Écrivez un message pour l'envoyer" 
                : "Envoyer le message"
            }
            arrow
          >
            <span>
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!message.trim() || !webSocketConnected}
                sx={{
                  background: webSocketConnected && message.trim()
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : webSocketConnected
                    ? 'linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%)'
                    : 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
                  color: 'white',
                  marginLeft: 1,
                  width: 48,
                  height: 48,
                  boxShadow: webSocketConnected && message.trim()
                    ? '0 8px 24px rgba(102, 126, 234, 0.4)'
                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                  '&:hover': webSocketConnected && message.trim() ? {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    transform: 'scale(1.1)',
                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.6)',
                  } : {},
                  transition: 'all 0.3s ease',
                  '&.Mui-disabled': {
                    background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                    color: '#9e9e9e',
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        
        {/* Indicateur d'état de connexion */}
        {!webSocketConnected && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mt: 1.5,
            color: '#ff9800',
            animation: 'fadeIn 0.5s ease',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 },
            }
          }}>
            <CloudOffIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="caption" fontWeight="600">
              Reconnexion en cours...
            </Typography>
          </Box>
        )}
      </Paper>
    </>
  );
};

export default OneToOneMessageInput;