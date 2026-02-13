// src/components/common/SearchBar.tsx
import React, { useState } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  List,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  ListItemButton,
  Fade,
  Chip,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  TagFaces as TagFacesIcon,
} from '@mui/icons-material'; 
import type { Contact, PrivateChatMessage } from '../../types/oneToOne.type';

interface SearchResult {
  type: 'message' | 'contact';
  data: PrivateChatMessage | Contact;
}

interface SearchBarProps {
  messages: PrivateChatMessage[];
  contacts: Contact[];
  currentUserId: number;
  onResultClick: (result: SearchResult) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  messages,
  contacts,
  currentUserId,
  onResultClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setResults([]);
      setShowResults(false);
      return;
    }

    const searchLower = query.toLowerCase();
    
    const messageResults = messages
      .filter(message => 
        message.content.toLowerCase().includes(searchLower) ||
        message.senderName1.toLowerCase().includes(searchLower) ||
        message.senderName2.toLowerCase().includes(searchLower)
      )
      .map(message => ({
        type: 'message' as const,
        data: message,
      }));

    const contactResults = contacts
      .filter(contact =>
        contact.username.toLowerCase().includes(searchLower) ||
        contact.lastMessage?.toLowerCase().includes(searchLower)
      )
      .map(contact => ({
        type: 'contact' as const,
        data: contact,
      }));

    const allResults = [...contactResults, ...messageResults];
    setResults(allResults.slice(0, 10));
    setShowResults(true);
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setShowResults(false);
    setIsFocused(false);
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result);
    handleClear();
  };

  const highlightText = (text: string, query: string) => {
    if (!query || !text) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <Box
              key={index}
              component="span"
              sx={{
                backgroundColor: alpha('#667eea', 0.2),
                color: '#667eea',
                fontWeight: 'bold',
                padding: '0 2px',
                borderRadius: 1,
                animation: 'highlight 0.3s ease',
                '@keyframes highlight': {
                  from: { backgroundColor: 'transparent', color: 'inherit' },
                  to: { backgroundColor: alpha('#667eea', 0.2), color: '#667eea' },
                }
              }}
            >
              {part}
            </Box>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const getGradientColor = (index: number) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Paper
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '50px',
          background: isFocused 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 242, 245, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid',
          borderColor: isFocused ? '#667eea' : 'rgba(255, 255, 255, 0.3)',
          boxShadow: isFocused 
            ? '0 20px 60px rgba(102, 126, 234, 0.3)' 
            : '0 10px 40px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <IconButton 
          sx={{ 
            p: '10px',
            color: isFocused ? '#667eea' : '#666',
            transition: 'color 0.3s ease',
          }}
        >
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ 
            ml: 1, 
            flex: 1,
            fontSize: '0.95rem',
            fontWeight: 500,
            color: '#333',
            '&::placeholder': {
              color: '#999',
            }
          }}
          placeholder="Rechercher des messages ou contacts..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
        {searchQuery && (
          <IconButton 
            onClick={handleClear}
            sx={{
              '&:hover': {
                backgroundColor: alpha('#667eea', 0.1),
                transform: 'rotate(90deg)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ClearIcon />
          </IconButton>
        )}
      </Paper>

      <Fade in={showResults && results.length > 0}>
        <Paper
          sx={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            left: 0,
            right: 0,
            maxHeight: 400,
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.3)',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 250, 0.98) 100%)',
            backdropFilter: 'blur(30px)',
            border: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.4)',
            animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '@keyframes slideDown': {
              from: { opacity: 0, transform: 'translateY(-10px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: alpha('#667eea', 0.05),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha('#667eea', 0.3),
              borderRadius: '4px',
              '&:hover': {
                background: alpha('#667eea', 0.5),
              }
            }
          }}
        >
          <Box sx={{ p: 1.5 }}>
            <Chip
              label={`${results.length} résultat${results.length > 1 ? 's' : ''}`}
              size="small"
              icon={<TagFacesIcon />}
              sx={{ 
                mb: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                animation: 'fadeIn 0.5s ease',
              }}
            />
          </Box>
          
          <List sx={{ p: 0 }}>
            {results.map((result, index) => {
              const isContact = result.type === 'contact';
              const contactData = isContact ? result.data as Contact : null;
              const messageData = !isContact ? result.data as PrivateChatMessage : null;
              
              return (
                <React.Fragment key={index}>
                  <ListItemButton
                    onClick={() => handleResultClick(result)}
                    sx={{
                      '&:hover': { 
                        background: isContact 
                          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)'
                          : 'linear-gradient(135deg, rgba(245, 87, 108, 0.08) 0%, rgba(240, 147, 251, 0.08) 100%)',
                        transform: 'translateX(4px)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      },
                      borderRadius: '16px',
                      mx: 1.5,
                      mb: 0.5,
                      py: 1.5,
                      animation: 'slideIn 0.3s ease',
                      animationDelay: `${index * 0.05}s`,
                      '@keyframes slideIn': {
                        from: { opacity: 0, transform: 'translateX(-20px)' },
                        to: { opacity: 1, transform: 'translateX(0)' },
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          background: isContact 
                            ? getGradientColor(index)
                            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          color: 'white',
                          fontWeight: 'bold',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          }
                        }}
                      >
                        {isContact
                          ? getInitials(contactData!.username)
                          : getInitials(
                              messageData!.senderId1 === currentUserId
                                ? messageData!.senderName2
                                : messageData!.senderName1
                            )}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isContact ? (
                            <PersonIcon sx={{ 
                              fontSize: 16, 
                              color: '#667eea',
                              animation: 'bounce 2s infinite',
                            }} />
                          ) : (
                            <MessageIcon sx={{ 
                              fontSize: 16, 
                              color: '#f5576c',
                              animation: 'bounce 2s infinite',
                              animationDelay: '0.5s',
                            }} />
                          )}
                          <Typography variant="subtitle2" fontWeight={700} color="#333">
                            {highlightText(
                              isContact
                                ? contactData!.username
                                : messageData!.senderId1 === currentUserId
                                ? messageData!.senderName2
                                : messageData!.senderName1,
                              searchQuery
                            )}
                          </Typography>
                          <Chip
                            label={isContact ? 'Contact' : 'Message'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              background: isContact 
                                ? alpha('#667eea', 0.1)
                                : alpha('#f5576c', 0.1),
                              color: isContact ? '#667eea' : '#f5576c',
                              border: 'none',
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="#666"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            mt: 0.5,
                            fontSize: '0.875rem',
                            lineHeight: 1.4,
                          }}
                        >
                          {highlightText(
                            isContact
                              ? contactData!.lastMessage || ''
                              : messageData!.content,
                            searchQuery
                          )}
                        </Typography>
                      }
                    />
                  </ListItemButton>

                  {index < results.length - 1 && (
                    <Divider 
                      sx={{ 
                        mx: 2, 
                        opacity: 0.1,
                        background: 'linear-gradient(to right, transparent, #667eea, transparent)',
                        height: '1px',
                      }} 
                    />
                  )}
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      </Fade>
    </Box>
  );
};

export default SearchBar;