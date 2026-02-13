// pages/UserDetail.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  IconButton,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Chat as ChatIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../services/api/user';
import { chatApi } from '../services/api/chat';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface UserDetail {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

interface UserRoom {
  id: number;
  name: string;
  type: string;
  participantCount: number;
  createdAt: string;
}

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [userRooms, setUserRooms] = useState<UserRoom[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (id) {
      fetchUserDetails();
      fetchUserRooms();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      // Note: You might need to adjust this API call based on your actual API
      const response = await userApi.getUserById(parseInt(id!));
      const userData = response.data?.data || response.data;
      
      if (userData) {
        setUser({
          id: userData.id,
          email: userData.email,
          role: userData.role || 'USER',
          isActive: userData.isActive !== false,
          createdAt: userData.createdAt,
          lastLogin: userData.lastLogin,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
        });
      }
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des données utilisateur');
      navigate('/dashboard'); // Redirect back if user not found
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRooms = async () => {
    try {
      const response = await chatApi.getUserChatRooms(parseInt(id!));
      const rooms = response.data || [];
      
      setUserRooms(rooms.map((room: any) => ({
        id: room.id,
        name: room.name,
        type: room.type || 'PUBLIC',
        participantCount: room.participantCount || 0,
        createdAt: room.createdAt,
      })));
    } catch (error) {
      console.error('Error fetching user rooms:', error);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleEditUser = () => {
    toast.success('Édition d\'utilisateur - Fonctionnalité à venir');
  };

  const handleToggleUserStatus = async () => {
    if (!user) return;
    
    try {
      // Note: You'll need to implement this API endpoint
      await userApi.updateUserStatus(user.id, !user.isActive);
      setUser({ ...user, isActive: !user.isActive });
      toast.success(`Utilisateur ${!user.isActive ? 'activé' : 'désactivé'} avec succès`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification du statut');
    }
  };

  const handleViewRoom = (roomId: number) => {
    navigate(`/chat/${roomId}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 3 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Utilisateur non trouvé
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Retour au tableau de bord
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={700}>
          Détails de l'utilisateur
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Left Column - User Info */}
        <Box sx={{ width: { xs: '100%', md: '40%' } }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              {/* User Avatar & Info */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    bgcolor: alpha(
                      user.role === 'ADMIN' 
                        ? theme.palette.secondary.main 
                        : theme.palette.primary.main,
                      0.1
                    ),
                    color: user.role === 'ADMIN' 
                      ? theme.palette.secondary.main 
                      : theme.palette.primary.main,
                    fontSize: 48,
                  }}
                >
                  {user.email.charAt(0).toUpperCase()}
                </Avatar>
                
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.email.split('@')[0]
                  }
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user.email}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    icon={user.role === 'ADMIN' ? <AdminIcon /> : <PersonIcon />}
                    label={user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                    color={user.role === 'ADMIN' ? 'secondary' : 'primary'}
                    variant="outlined"
                  />
                  
                  <Chip
                    icon={user.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                    label={user.isActive ? 'Actif' : 'Inactif'}
                    color={user.isActive ? 'success' : 'error'}
                  />
                </Box>
              </Box>

              {/* User Details */}
              <Divider sx={{ my: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary={user.email}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Date d'inscription" 
                    secondary={formatDate(user.createdAt)}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dernière connexion" 
                    secondary={formatDate(user.lastLogin)}
                  />
                </ListItem>
                
                {user.username && (
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Nom d'utilisateur" 
                      secondary={user.username}
                    />
                  </ListItem>
                )}
              </List>

              {/* Action Buttons */}
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditUser}
                >
                  Modifier l'utilisateur
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  color={user.isActive ? 'error' : 'success'}
                  onClick={handleToggleUserStatus}
                >
                  {user.isActive ? 'Désactiver le compte' : 'Activer le compte'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Column - User Activity */}
        <Box sx={{ width: { xs: '100%', md: '60%' } }}>
          {/* Tabs */}
          <Paper sx={{ mb: 3, borderRadius: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
            >
              <Tab label="Salons de chat" icon={<ChatIcon />} />
              <Tab label="Statistiques" icon={<TrendingUpIcon />} />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {activeTab === 0 ? (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Salons fréquentés ({userRooms.length})
                </Typography>
                
                {userRooms.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography color="text.secondary">
                      Cet utilisateur n'a rejoint aucun salon
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {userRooms.map((room) => (
                      <ListItem
                        key={room.id}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                          },
                          cursor: 'pointer',
                        }}
                        onClick={() => handleViewRoom(room.id)}
                      >
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              bgcolor: room.type === 'PRIVATE'
                                ? alpha(theme.palette.error.main, 0.1)
                                : alpha(theme.palette.primary.main, 0.1),
                              color: room.type === 'PRIVATE'
                                ? theme.palette.error.main
                                : theme.palette.primary.main,
                            }}
                          >
                            {room.type === 'PRIVATE' ? <LockIcon /> : <PublicIcon />}
                          </Avatar>
                        </ListItemIcon>
                        
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600}>
                              {room.name}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                              <Chip
                                label={room.type === 'PRIVATE' ? 'Privé' : 'Public'}
                                size="small"
                                sx={{
                                  bgcolor: room.type === 'PRIVATE'
                                    ? alpha(theme.palette.error.main, 0.1)
                                    : alpha(theme.palette.primary.main, 0.1),
                                  color: room.type === 'PRIVATE'
                                    ? theme.palette.error.main
                                    : theme.palette.primary.main,
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {room.participantCount} participants
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Créé le {dayjs(room.createdAt).format('DD/MM/YYYY')}
                              </Typography>
                            </Box>
                          }
                        />
                        
                        <IconButton size="small">
                          <ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Activité et statistiques
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: 2,
                  mt: 2,
                  '& > *': {
                    width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' }
                  }
                }}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h4" color="primary" fontWeight={800}>
                      {userRooms.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Salons
                    </Typography>
                  </Paper>
                  
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h4" color="secondary" fontWeight={800}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Statut
                    </Typography>
                  </Paper>
                  
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h4" color="success.main" fontWeight={800}>
                      {user.role === 'ADMIN' ? 'Admin' : 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Rôle
                    </Typography>
                  </Paper>
                  
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h4" color="warning.main" fontWeight={800}>
                      {user.lastLogin ? dayjs(user.lastLogin).fromNow() : 'Jamais'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dernière activité
                    </Typography>
                  </Paper>
                </Box>
                
                {/* Additional Stats */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Détails d'inscription
                  </Typography>
                  <Typography variant="body2">
                    Membre depuis {dayjs(user.createdAt).fromNow()} ({dayjs(user.createdAt).format('DD MMMM YYYY')})
                  </Typography>
                  {user.lastLogin && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Dernière connexion: {dayjs(user.lastLogin).format('DD MMMM YYYY à HH:mm')}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default UserDetailPage;