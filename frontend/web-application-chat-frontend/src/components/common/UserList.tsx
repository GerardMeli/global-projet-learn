// src/components/common/UserList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  ListItemButton,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import type { User } from '../../types/oneToOne.type';
import { userApi } from '../../services/api/user';

interface UserListProps {
  currentUserId: number;
  onSelectUser: (user: User) => void;
  existingContacts: Array<{ id: number; email: string }>;
}

const UserList: React.FC<UserListProps> = ({
  currentUserId,
  onSelectUser,
  existingContacts,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  // Fetch all users except current user
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getAllUsersExceptCurrentUser(currentUserId);
      
      if (response.data) {
        const fetchedUsers = response.data.map((user: any) => ({
          id: user.id,
          email: user.email,
          username: user.username || user.email.split('@')[0],
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          avatarUrl: user.avatarUrl || null,
          status: user.status || 'offline',
        }));
        
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      }
    } catch (err: any) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Search users
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }

    try {
      setSearching(true);
      const response = await userApi.searchUsers(currentUserId, query);
      
      if (response.data) {
        const searchedUsers = response.data.map((user: any) => ({
          id: user.id,
          email: user.email,
          username: user.username || user.email.split('@')[0],
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          avatarUrl: user.avatarUrl || null,
          status: user.status || 'offline',
        }));
        
        setFilteredUsers(searchedUsers);
      }
    } catch (err: any) {
      setError('Erreur lors de la recherche');
      console.error('Error searching users:', err);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        setFilteredUsers(users);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, users]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Check if user is already a contact
  const isExistingContact = (userId: number): boolean => {
    return existingContacts.some(contact => contact.id === userId);
  };

  // Get user initials
  const getInitials = (user: User): string => {
    if (user.email) {
      return `${user.email.charAt(0)}`.toUpperCase();
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  // Get gradient color based on user ID
  const getAvatarColor = (userId: number): string => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    ];
    return colors[userId % colors.length];
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'online':
        return '#4caf50';
      case 'away':
        return '#ff9800';
      case 'busy':
        return '#f44336';
      case 'offline':
      default:
        return '#9e9e9e';
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
      }}>
        <Typography variant="h6" fontWeight="700" gutterBottom>
          Ajouter un contact
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Recherchez et démarrez une nouvelle conversation
        </Typography>
        
        {/* Search bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Rechercher un utilisateur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searching && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.8)',
            }
          }}
        />
        
        {/* Stats */}
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Chip
            label={`${users.length} utilisateurs`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`${filteredUsers.length} résultats`}
            size="small"
            color="secondary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Box>

      {/* Error display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mx: 2, 
            mt: 2,
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* User list */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredUsers.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 4,
            height: '100%',
            textAlign: 'center',
          }}>
            {searchQuery ? (
              <>
                <SearchIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucun utilisateur trouvé
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Essayez avec un autre nom ou email
                </Typography>
              </>
            ) : (
              <>
                <PersonIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucun utilisateur disponible
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tous les utilisateurs sont déjà vos contacts
                </Typography>
              </>
            )}
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredUsers.map((user, index) => {
              const isContact = isExistingContact(user.id);
              
              return (
                <React.Fragment key={user.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => onSelectUser(user)}
                      disabled={isContact}
                      sx={{
                        px: 2.5,
                        py: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: isContact 
                            ? 'rgba(158, 158, 158, 0.1)' 
                            : 'rgba(102, 126, 234, 0.05)',
                        },
                        '&.Mui-disabled': {
                          opacity: 0.7,
                        },
                        animation: 'slideIn 0.3s ease-out',
                        animationDelay: `${index * 0.05}s`,
                        '@keyframes slideIn': {
                          from: {
                            opacity: 0,
                            transform: 'translateX(-10px)',
                          },
                          to: {
                            opacity: 1,
                            transform: 'translateX(0)',
                          }
                        }
                      }}
                    >
                      <ListItemAvatar sx={{ position: 'relative' }}>
                        <Avatar
                          sx={{
                            width: 52,
                            height: 52,
                            background: getAvatarColor(user.id),
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: 16,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.1) rotate(5deg)',
                              boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                            }
                          }}
                        >
                          {getInitials(user)}
                        </Avatar>
                        
                        {/* Status indicator */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 2,
                            right: 2,
                            width: 12,
                            height: 12,
                            border: '2px solid white',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(user.role || 'offline'),
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          }}
                        />
                      </ListItemAvatar>

                      <ListItemText
                        sx={{ ml: 2 }}
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography 
                              variant="subtitle1" 
                              fontWeight="700"
                              sx={{
                                color: isContact ? 'text.disabled' : '#333',
                              }}
                            >
                              {user.email}
                            </Typography>
                            
                            {isContact && (
                              <Tooltip title="Déjà contact">
                                <CheckCircleIcon 
                                  fontSize="small" 
                                  color="success"
                                  sx={{ 
                                    animation: 'fadeIn 0.5s ease',
                                    '@keyframes fadeIn': {
                                      from: { opacity: 0, transform: 'scale(0.8)' },
                                      to: { opacity: 1, transform: 'scale(1)' },
                                    }
                                  }}
                                />
                              </Tooltip>
                            )}
                          </Stack>
                        }
                        secondary={
                          <Stack direction="column" spacing={0.5}>
                            <Typography 
                              variant="body2" 
                              color={isContact ? 'text.disabled' : 'text.secondary'}
                            >
                              {user.email}
                            </Typography>
                            
                            {user.email && (
                              <Typography 
                                variant="caption" 
                                color={isContact ? 'text.disabled' : 'text.secondary'}
                                sx={{ fontStyle: 'italic' }}
                              >
                                {user.email}
                              </Typography>
                            )}
                            
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                              <Chip
                                label={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Inconnu'}
                                size="small"
                                sx={{
                                  backgroundColor: getStatusColor(user.role || 'offline'),
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  height: 20,
                                  '& .MuiChip-label': {
                                    px: 1,
                                  }
                                }}
                              />
                              
                              {isContact ? (
                                <Chip
                                  label="Contact"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  sx={{
                                    fontSize: '0.7rem',
                                    height: 20,
                                    borderColor: '#4caf50',
                                    color: '#4caf50',
                                  }}
                                />
                              ) : (
                                <Chip
                                  icon={<AddIcon fontSize="small" />}
                                  label="Ajouter"
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{
                                    fontSize: '0.7rem',
                                    height: 20,
                                    borderColor: '#667eea',
                                    color: '#667eea',
                                    '&:hover': {
                                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                    }
                                  }}
                                />
                              )}
                            </Stack>
                          </Stack>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  
                  {index < filteredUsers.length - 1 && (
                    <Divider 
                      variant="inset" 
                      component="li" 
                      sx={{ 
                        ml: '100px !important',
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
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ 
        p: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        textAlign: 'center',
      }}>
        <Typography variant="caption" color="text.secondary">
          {existingContacts.length} contacts existants • {filteredUsers.length} utilisateurs disponibles
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Sélectionnez un utilisateur pour démarrer une conversation
        </Typography>
      </Box>
    </Box>
  );
};

export default UserList;