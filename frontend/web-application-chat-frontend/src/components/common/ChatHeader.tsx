// src/components/ChatHeader.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Badge,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Container,
  Fade,
  alpha,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Videocam as VideocamIcon,
  Phone as PhoneIcon,
  MoreVert as MoreVertIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  Archive as ArchiveIcon,
  Report as ReportIcon,
  Info as InfoIcon,
  PersonAdd as PersonAddIcon,
  Chat as ChatIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';

interface ChatHeaderProps {
  contactName?: string;
  online?: boolean;
  onBack?: () => void;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  onClose?: () => void;
  onMenuAction?: (action: string) => void;
  unreadCount?: number;
  connectionStatus?: boolean;
  showChat?: boolean;
  contactAvatar?: string;
  onNewChat?: () => void;
  onToggleChat?: () => void; // New prop for toggling chat visibility
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  contactName = '',
  online = false,
  onBack,
  onVideoCall,
  onVoiceCall,
  onClose,
  onMenuAction,
  unreadCount = 0,
  connectionStatus = true,
  showChat = false,
  contactAvatar = '',
  onNewChat,
  onToggleChat,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: string) => {
    if (onMenuAction) {
      onMenuAction(action);
    }
    handleMenuClose();
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  if (!showChat) {
    return (
      <>
        <AppBar
          position="static"
          color="default"
          elevation={0}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Container maxWidth="lg">
            <Toolbar 
              sx={{ 
                minHeight: 64,
                px: { xs: 0, sm: 2 },
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ChatIcon 
                    sx={{ 
                      color: '#667eea',
                      fontSize: 28,
                    }} 
                  />
                  <Typography variant="h6" fontWeight="600" color="text.primary">
                    Messages
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  backgroundColor: alpha('#667eea', 0.08),
                }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: connectionStatus ? '#4caf50' : '#f44336',
                      animation: connectionStatus ? 'pulse 2s ease-in-out infinite' : 'none',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.6 },
                      }
                    }}
                  />
                  <Typography variant="caption" fontWeight="500" color="text.secondary">
                    {connectionStatus ? 'Connecté' : 'Déconnecté'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {onNewChat && (
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={onNewChat}
                    sx={{
                      backgroundColor: '#667eea',
                      color: 'white',
                      fontWeight: 500,
                      borderRadius: 2,
                      px: 2,
                      '&:hover': {
                        backgroundColor: '#5a6fd8',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Nouveau chat
                  </Button>
                )}
                
                {onToggleChat && (
                  <IconButton
                    onClick={onToggleChat}
                    sx={{
                      backgroundColor: alpha('#667eea', 0.1),
                      color: '#667eea',
                      '&:hover': {
                        backgroundColor: alpha('#667eea', 0.2),
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <KeyboardArrowUpIcon />
                  </IconButton>
                )}
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        {/* WhatsApp/Telegram-like Background when chat is hidden */}
        <Fade in={!showChat} timeout={300}>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f2f5',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 'calc(100vh - 64px)',
              p: 3,
            }}
          >
            {/* Background Pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(102, 126, 234, 0.05) 0%, transparent 55%), radial-gradient(circle at 75% 75%, rgba(118, 75, 162, 0.05) 0%, transparent 55%)',
                opacity: 0.6,
              }}
            />
            
            {/* Central Content */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                textAlign: 'center',
                maxWidth: 400,
                p: 4,
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <ChatBubbleOutlineIcon
                sx={{
                  fontSize: 64,
                  color: alpha('#667eea', 0.3),
                  mb: 2,
                }}
              />
              
              <Typography variant="h5" fontWeight="600" color="text.primary" gutterBottom>
                Chat caché
              </Typography>
              
              <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
                Sélectionnez une conversation ou commencez un nouveau chat pour voir les messages ici.
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<KeyboardArrowDownIcon />}
                onClick={onToggleChat}
                sx={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  fontWeight: 500,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  '&:hover': {
                    borderColor: '#5a6fd8',
                    backgroundColor: alpha('#667eea', 0.04),
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Afficher le chat
              </Button>
            </Box>

            {/* Bottom Toggle Button */}
            {onToggleChat && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 2,
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<KeyboardArrowUpIcon />}
                  onClick={onToggleChat}
                  sx={{
                    backgroundColor: '#667eea',
                    color: 'white',
                    fontWeight: 500,
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      backgroundColor: '#5a6fd8',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 24px rgba(102, 126, 234, 0.4)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Ouvrir le chat
                </Button>
              </Box>
            )}
          </Box>
        </Fade>
      </>
    );
  }

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: '#FFFFFF',
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 1.5, sm: 2.5 } }}>
        {onBack && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBack}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha('#667eea', 0.1),
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            color={online ? 'success' : 'default'}
            invisible={!online}
          >
            <Avatar 
              sx={{ 
                width: 42,
                height: 42,
                bgcolor: '#667eea',
                color: 'white',
                fontWeight: 600,
                fontSize: 16,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              {getInitials(contactName)}
            </Avatar>
          </Badge>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
              <Typography 
                variant="subtitle1" 
                noWrap 
                fontWeight="600" 
                color="text.primary"
                sx={{ flex: 1 }}
              >
                {contactName}
              </Typography>
              
              {unreadCount > 0 && (
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{ 
                    '& .MuiBadge-badge': {
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                    }
                  }}
                />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography 
                variant="caption" 
                fontWeight="500"
                sx={{
                  color: online ? '#4caf50' : 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: online ? '#4caf50' : 'text.secondary',
                  }}
                />
                {online ? 'En ligne' : 'Hors ligne'}
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {connectionStatus ? (
                  <WifiIcon 
                    fontSize="inherit" 
                    sx={{ 
                      fontSize: 12, 
                      color: '#4caf50',
                    }} 
                  />
                ) : (
                  <WifiOffIcon 
                    fontSize="inherit" 
                    sx={{ 
                      fontSize: 12, 
                      color: '#f44336',
                    }} 
                  />
                )}
                <Typography 
                  variant="caption" 
                  fontWeight="500"
                  sx={{ 
                    color: connectionStatus ? '#4caf50' : '#f44336',
                  }}
                >
                  {connectionStatus ? 'Connecté' : 'Déconnecté'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton 
            color="inherit" 
            onClick={onVoiceCall}
            disabled={!connectionStatus || !online}
            title={!connectionStatus ? "WebSocket non connecté" : !online ? "Contact hors ligne" : "Appel vocal"}
            sx={{
              color: (connectionStatus && online) ? 'text.primary' : 'action.disabled',
              '&:hover': (connectionStatus && online) ? {
                backgroundColor: alpha('#4caf50', 0.1),
                color: '#4caf50',
              } : {},
            }}
          >
            <PhoneIcon />
          </IconButton>
          
          <IconButton 
            color="inherit" 
            onClick={onVideoCall}
            disabled={!connectionStatus || !online}
            title={!connectionStatus ? "WebSocket non connecté" : !online ? "Contact hors ligne" : "Appel vidéo"}
            sx={{
              color: (connectionStatus && online) ? 'text.primary' : 'action.disabled',
              '&:hover': (connectionStatus && online) ? {
                backgroundColor: alpha('#667eea', 0.1),
                color: '#667eea',
              } : {},
            }}
          >
            <VideocamIcon />
          </IconButton>
          
          <IconButton 
            color="inherit"
            onClick={handleMenuOpen}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha('#667eea', 0.1),
                color: '#667eea',
              },
            }}
          >
            <MoreVertIcon />
          </IconButton>
          
          {onToggleChat && (
            <IconButton 
              color="inherit" 
              onClick={onToggleChat}
              title="Cacher le chat"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: alpha('#667eea', 0.1),
                  color: '#667eea',
                },
              }}
            >
              <KeyboardArrowDownIcon />
            </IconButton>
          )}
          
          {onClose && (
            <IconButton 
              color="inherit" 
              onClick={onClose}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: alpha('#f44336', 0.1),
                  color: '#f44336',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        {/* Menu des options */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              minWidth: 180,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              mt: 1,
            }
          }}
        >
          <MenuItem onClick={() => handleAction('info')}>
            <ListItemIcon>
              <InfoIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Informations" />
          </MenuItem>
          <MenuItem onClick={() => handleAction('archive')}>
            <ListItemIcon>
              <ArchiveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Archiver" />
          </MenuItem>
          <MenuItem onClick={() => handleAction('clear')}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Effacer l'historique" />
          </MenuItem>
          <MenuItem onClick={() => handleAction('block')}>
            <ListItemIcon>
              <BlockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Bloquer" />
          </MenuItem>
          <MenuItem onClick={() => handleAction('report')}>
            <ListItemIcon>
              <ReportIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Signaler" />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default ChatHeader;