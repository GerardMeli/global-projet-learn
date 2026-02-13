// src/components/ContactList.tsx
import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Badge,
  Divider,
  ListItemButton,
  Chip,
  Stack,
  alpha,
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import type { Contact } from '../../types/oneToOne.type';

interface ContactListProps {
  contacts: Contact[];
  currentUserId: number;
  selectedContactId: number | null;
  onSelectContact: (contactId: number) => void;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  selectedContactId,
  onSelectContact,
}) => {
  const formatTime = (timestamp: string | null | undefined) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, 'HH:mm', { locale: fr });
    }
    return format(date, 'dd/MM', { locale: fr });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const getAvatarColor = (userId: number) => {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#4ecdc4', '#45b7d1',
      '#96fbc4', '#f9d423', '#ff8a00', '#52b788', '#fd746c'
    ];
    return colors[userId % colors.length];
  };

  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        overflowY: 'auto',
        background: '#FFFFFF',
        borderRight: '1px solid',
        borderColor: 'divider',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '2px',
        }
      }}
    >
      <List sx={{ p: 0 }}>
        {contacts.map((contact, index) => {
          const isSelected = contact.userId === selectedContactId;
          const hasUnread = contact.unreadCount > 0;
          
          return (
            <React.Fragment key={contact.userId}>
              <ListItem 
                disablePadding
                sx={{
                  position: 'relative',
                  '&:hover': {
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '3px',
                      bgcolor: getAvatarColor(contact.userId),
                      borderTopRightRadius: '3px',
                      borderBottomRightRadius: '3px',
                    }
                  }
                }}
              >
                <ListItemButton
                  selected={isSelected}
                  onClick={() => onSelectContact(contact.userId)}
                  sx={{
                    py: 1.75,
                    px: 2.5,
                    gap: 2,
                    borderRadius: 0,
                    transition: 'background-color 0.2s ease',
                    backgroundColor: isSelected ? alpha(getAvatarColor(contact.userId), 0.06) : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(getAvatarColor(contact.userId), 0.04),
                    },
                    '&.Mui-selected': {
                      backgroundColor: alpha(getAvatarColor(contact.userId), 0.08),
                      '&:hover': {
                        backgroundColor: alpha(getAvatarColor(contact.userId), 0.1),
                      }
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 52 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      sx={{
                        '& .MuiBadge-dot': {
                          backgroundColor: contact.online ? '#4caf50' : '#9e9e9e',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          border: '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          animation: contact.online ? 'pulse 2s ease-in-out infinite' : 'none',
                          '@keyframes pulse': {
                            '0%, 100%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.2)' },
                          }
                        }
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: getAvatarColor(contact.userId),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: 15,
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          }
                        }}
                      >
                        {getInitials(contact.username)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Stack 
                        direction="row" 
                        justifyContent="space-between" 
                        alignItems="flex-start"
                        sx={{ mb: 0.25 }}
                      >
                        <Typography 
                          variant="subtitle2" 
                          noWrap
                          sx={{
                            fontWeight: hasUnread ? 700 : 600,
                            fontSize: '0.9375rem',
                            color: isSelected ? getAvatarColor(contact.userId) : 'text.primary',
                            flex: 1,
                            mr: 1,
                          }}
                        >
                          {contact.username}
                        </Typography>

                        <Stack alignItems="flex-end" spacing={0.25}>
                          {contact.lastMessageTime && (
                            <Typography 
                              variant="caption" 
                              sx={{
                                color: hasUnread ? getAvatarColor(contact.userId) : 'text.secondary',
                                fontWeight: hasUnread ? 600 : 400,
                                fontSize: '0.75rem',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {formatTime(contact.lastMessageTime)}
                            </Typography>
                          )}
                          
                          {contact.lastMessage?.includes('✔') && (
                            <DoneAllIcon 
                              sx={{ 
                                fontSize: 13, 
                                color: contact.lastMessage.includes('✔✔') 
                                  ? getAvatarColor(contact.userId)
                                  : 'action.disabled',
                              }} 
                            />
                          )}
                        </Stack>
                      </Stack>
                    }
                    secondary={
                      <Stack 
                        direction="row" 
                        justifyContent="space-between" 
                        alignItems="center"
                        spacing={1}
                      >
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{
                            fontWeight: hasUnread ? 500 : 400,
                            color: hasUnread ? getAvatarColor(contact.userId) : 'text.secondary',
                            fontSize: '0.8125rem',
                            flex: 1,
                            fontStyle: !contact.lastMessage ? 'italic' : 'normal',
                            opacity: !contact.lastMessage ? 0.6 : 1,
                          }}
                        >
                          {contact.lastMessage || 'Aucun message'}
                        </Typography>
                        
                        {contact.unreadCount > 0 && (
                          <Chip
                            label={contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                            size="small"
                            sx={{
                              bgcolor: getAvatarColor(contact.userId),
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.6875rem',
                              height: '20px',
                              minWidth: '20px',
                              '& .MuiChip-label': {
                                px: 0.5,
                              }
                            }}
                          />
                        )}
                      </Stack>
                    }
                    sx={{ 
                      m: 0,
                      '& .MuiListItemText-primary': {
                        marginBottom: 0,
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
              
              {index < contacts.length - 1 && (
                <Divider 
                  variant="middle" 
                  component="li" 
                  sx={{ 
                    mx: 3,
                    opacity: 0.5,
                  }} 
                />
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
};

export default ContactList;