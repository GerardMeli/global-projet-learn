// pages/MessagesPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  alpha,
  useTheme,
  Fade,
  Slide,
  Grow,
  Tooltip,
  Badge,
  InputAdornment,
  Divider,
  LinearProgress,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  FilterAlt as FilterAltIcon,
  Sort as SortIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { chatApi } from '../services/api/chat';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';

interface Message {
  id: number;
  content: string;
  sender: {
    id: number;
    email: string;
    avatar?: string;
  };
  chatRoom: {
    id: number;
    name: string;
    type: string;
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  likes?: number;
  replies?: number;
}

interface ChatRoom {
  id: number;
  name: string;
}

const MessagesPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'room' | 'sender'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const roomsResponse = await chatApi.getAllChatRooms();
      setRooms(roomsResponse.data || []);
      
      const allMessages: Message[] = [];
      
      for (const room of roomsResponse.data || []) {
        try {
          const messagesResponse = await chatApi.getOrderedMessages(room.id);
          const roomMessages = (messagesResponse.data || []).map((msg: any) => ({
            ...msg,
            chatRoom: {
              id: room.id,
              name: room.name,
              type: room.type,
            },
            sender: {
              ...msg.sender,
              avatar: `https://i.pravatar.cc/150?u=${msg.sender.id}`,
            },
            likes: Math.floor(Math.random() * 50),
            replies: Math.floor(Math.random() * 10),
          }));
          allMessages.push(...roomMessages);
        } catch (error) {
          console.error(`Error loading messages for room ${room.id}:`, error);
        }
      }
      
      allMessages.sort((a, b) => 
        dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
      );
      
      setMessages(allMessages);
      
      toast.success(`${allMessages.length} messages chargés`, {
        icon: '💬',
        style: {
          borderRadius: '10px',
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
        },
      });
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError(error.response?.data?.message || 'Erreur de connexion au serveur');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.chatRoom.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRoom = roomFilter === 'ALL' || message.chatRoom.id === roomFilter;
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && !message.isDeleted) ||
      (statusFilter === 'DELETED' && message.isDeleted);
    
    return matchesSearch && matchesRoom && matchesStatus;
  })
  .sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'room':
        aValue = a.chatRoom.name.toLowerCase();
        bValue = b.chatRoom.name.toLowerCase();
        break;
      case 'sender':
        aValue = a.sender.email.toLowerCase();
        bValue = b.sender.email.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const paginatedMessages = filteredMessages.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleToggleDelete = async (message: Message, restore: boolean = false) => {
    try {
      if (restore) {
        await chatApi.restoreMessage(message.id);
        toast.success('Message restauré avec succès');
      } else {
        await chatApi.deleteMessage(message.id);
        toast.success('Message supprimé avec succès');
      }
      
      setMessages(messages.map(m => 
        m.id === message.id ? { ...m, isDeleted: !restore } : m
      ));
      
    } catch (error: any) {
      console.error('Error toggling message:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    }
  };

  const handleViewDetails = (message: Message) => {
    setSelectedMessage(message);
    setDetailDialogOpen(true);
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getMessageStats = () => {
    const total = messages.length;
    const deleted = messages.filter(m => m.isDeleted).length;
    const active = total - deleted;
    const avgPerRoom = rooms.length > 0 ? (total / rooms.length).toFixed(1) : '0';
    
    return { total, deleted, active, avgPerRoom };
  };

  const stats = getMessageStats();

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '80vh',
          flexDirection: 'column',
          gap: 3
        }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            Chargement des messages...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* En-tête */}
      <Grow in={true}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
            }
          }}
        >
          <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'stretch' : 'center'} gap={3} mb={4}>
            <Box>
              <Typography variant="h2" fontWeight="800" gutterBottom sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.primary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Gestion des Messages
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                Consultez, modifiez et gérez tous les messages de votre plateforme.
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={loadData}
              sx={{
                borderRadius: 3,
                px: 3,
                background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.primary.main} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                }
              }}
            >
              Actualiser
            </Button>
          </Box>
          
          {/* Statistiques */}
          <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
            <Fade in={true}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: 3,
                  flex: 1,
                  minWidth: 120,
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 40, height: 40 }}>
                    <ChatIcon sx={{ color: theme.palette.primary.main }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Total Messages
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h3" fontWeight="bold" color={theme.palette.primary.main} lineHeight={1}>
                  {stats.total}
                </Typography>
              </Paper>
            </Fade>
            
            <Fade in={true} style={{ transitionDelay: '100ms' }}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  borderRadius: 3,
                  flex: 1,
                  minWidth: 120,
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), width: 40, height: 40 }}>
                    <PersonIcon sx={{ color: theme.palette.success.main }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Messages Actifs
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h3" fontWeight="bold" color={theme.palette.success.main} lineHeight={1}>
                  {stats.active}
                </Typography>
              </Paper>
            </Fade>
            
            <Fade in={true} style={{ transitionDelay: '200ms' }}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                  borderRadius: 3,
                  flex: 1,
                  minWidth: 120,
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), width: 40, height: 40 }}>
                    <DeleteIcon sx={{ color: theme.palette.error.main }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Messages Supprimés
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h3" fontWeight="bold" color={theme.palette.error.main} lineHeight={1}>
                  {stats.deleted}
                </Typography>
              </Paper>
            </Fade>
            
            <Fade in={true} style={{ transitionDelay: '300ms' }}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                  borderRadius: 3,
                  flex: 1,
                  minWidth: 120,
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), width: 40, height: 40 }}>
                    <TrendingUpIcon sx={{ color: theme.palette.warning.main }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Moyenne / Salon
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h3" fontWeight="bold" color={theme.palette.warning.main} lineHeight={1}>
                  {stats.avgPerRoom}
                </Typography>
              </Paper>
            </Fade>
          </Box>
          
          {error && (
            <Slide direction="down" in={!!error}>
              <Alert 
                severity="error" 
                icon={<WarningIcon />}
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                }}
              >
                {error}
              </Alert>
            </Slide>
          )}
          
          {/* Barre de filtres */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <TextField
                fullWidth
                placeholder="Rechercher dans les messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                  }
                }}
              />
            </Box>
            
            <Box display="flex" flexWrap="wrap" gap={2}>
              <FormControl sx={{ minWidth: 200, flex: 1 }}>
                <InputLabel shrink>Salon de discussion</InputLabel>
                <Select
                  value={roomFilter}
                  label="Salon de discussion"
                  onChange={(e) => setRoomFilter(e.target.value as number | 'ALL')}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="ALL">
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <FilterAltIcon fontSize="small" />
                      Tous les salons
                    </Box>
                  </MenuItem>
                  {rooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <ChatIcon fontSize="small" />
                        {room.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel shrink>Statut</InputLabel>
                <Select
                  value={statusFilter}
                  label="Statut"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="ALL">Tous les statuts</MenuItem>
                  <MenuItem value="ACTIVE">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.success.main }} />
                      Actifs
                    </Box>
                  </MenuItem>
                  <MenuItem value="DELETED">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.error.main }} />
                      Supprimés
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel shrink>Trier par</InputLabel>
                <Select
                  value={sortBy}
                  label="Trier par"
                  onChange={(e) => setSortBy(e.target.value as any)}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="date">Date (récent)</MenuItem>
                  <MenuItem value="room">Salon (A-Z)</MenuItem>
                  <MenuItem value="sender">Expéditeur (A-Z)</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterAltIcon fontSize="small" />
              {filteredMessages.length} message(s) trouvé(s) • {stats.deleted} message(s) supprimé(s)
            </Typography>
          </Paper>
        </Paper>
      </Grow>

      {/* Tableau des messages */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                bgcolor: alpha(theme.palette.info.main, 0.02),
                '& th': {
                  borderBottom: `2px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  fontWeight: 600,
                }
              }}>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleSort('date')}
                    startIcon={<SortIcon />}
                    sx={{ 
                      fontWeight: '600',
                      color: 'text.primary',
                      textTransform: 'none',
                    }}
                  >
                    Date
                    {sortBy === 'date' && (
                      <Typography component="span" sx={{ ml: 0.5 }}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </Typography>
                    )}
                  </Button>
                </TableCell>
                <TableCell>Contenu</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleSort('sender')}
                    startIcon={<SortIcon />}
                    sx={{ 
                      fontWeight: '600',
                      color: 'text.primary',
                      textTransform: 'none',
                    }}
                  >
                    Expéditeur
                    {sortBy === 'sender' && (
                      <Typography component="span" sx={{ ml: 0.5 }}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </Typography>
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleSort('room')}
                    startIcon={<SortIcon />}
                    sx={{ 
                      fontWeight: '600',
                      color: 'text.primary',
                      textTransform: 'none',
                    }}
                  >
                    Salon
                    {sortBy === 'room' && (
                      <Typography component="span" sx={{ ml: 0.5 }}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </Typography>
                    )}
                  </Button>
                </TableCell>
                <TableCell>Engagement</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <SearchIcon sx={{ fontSize: 80, color: alpha(theme.palette.text.secondary, 0.3), mb: 3 }} />
                      <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
                        Aucun message trouvé
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                        {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun message disponible'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMessages.map((message, index) => (
                  <TableRow 
                    key={message.id} 
                    hover 
                    onClick={() => handleViewDetails(message)}
                    sx={{ 
                      opacity: message.isDeleted ? 0.7 : 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.info.main, 0.03),
                      }
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          {dayjs(message.createdAt).format('DD/MM/YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                          <AccessTimeIcon sx={{ fontSize: 12 }} />
                          {dayjs(message.createdAt).format('HH:mm')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.5,
                        }}
                      >
                        {message.content}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar 
                          src={message.sender.avatar}
                          sx={{ width: 36, height: 36 }}
                        >
                          {message.sender.email.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {message.sender.email.split('@')[0]}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {message.sender.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                          <ChatIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {message.chatRoom.name}
                          </Typography>
                          <Chip
                            label={message.chatRoom.type === 'PRIVATE' ? 'Privé' : 'Public'}
                            size="small"
                            sx={{ 
                              height: 18,
                              fontSize: '0.65rem',
                              bgcolor: message.chatRoom.type === 'PRIVATE' 
                                ? alpha(theme.palette.error.main, 0.1) 
                                : alpha(theme.palette.success.main, 0.1),
                              color: message.chatRoom.type === 'PRIVATE' 
                                ? theme.palette.error.main 
                                : theme.palette.success.main,
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={2}>
                        <Tooltip title="Likes">
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Typography variant="body2" color="error.main" fontWeight="500">
                              ♥
                            </Typography>
                            <Typography variant="body2">
                              {message.likes}
                            </Typography>
                          </Box>
                        </Tooltip>
                        <Tooltip title="Réponses">
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <ChatIcon sx={{ fontSize: 16, color: theme.palette.info.main }} />
                            <Typography variant="body2">
                              {message.replies}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={message.isDeleted ? 'Supprimé' : 'Actif'}
                        size="small"
                        sx={{ 
                          bgcolor: message.isDeleted 
                            ? alpha(theme.palette.error.main, 0.1) 
                            : alpha(theme.palette.success.main, 0.1),
                          color: message.isDeleted 
                            ? theme.palette.error.main 
                            : theme.palette.success.main,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title="Voir les détails">
                          <IconButton
                            size="small"
                            sx={{ 
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.info.main, 0.2),
                              }
                            }}
                            onClick={() => handleViewDetails(message)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {message.isDeleted ? (
                          <Tooltip title="Restaurer">
                            <IconButton
                              size="small"
                              sx={{ 
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.success.main, 0.2),
                                }
                              }}
                              onClick={() => handleToggleDelete(message, true)}
                            >
                              <RestoreIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              sx={{ 
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                color: theme.palette.error.main,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.error.main, 0.2),
                                }
                              }}
                              onClick={() => handleToggleDelete(message, false)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {filteredMessages.length > 0 && (
          <TablePagination
            component="div"
            count={filteredMessages.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} sur ${count}`
            }
            sx={{
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontWeight: 500,
              }
            }}
          />
        )}
      </Paper>

      {/* Dialog de détails */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }
        }}
      >
        {selectedMessage && (
          <>
            <DialogTitle sx={{ pb: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Typography variant="h5" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                <InfoIcon color="info" />
                Détails du message
              </Typography>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ pt: 1 }}>
                {/* Carte du message */}
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 3,
                    borderColor: selectedMessage.isDeleted 
                      ? alpha(theme.palette.error.main, 0.2) 
                      : alpha(theme.palette.info.main, 0.2),
                    bgcolor: selectedMessage.isDeleted 
                      ? alpha(theme.palette.error.main, 0.02) 
                      : alpha(theme.palette.info.main, 0.02),
                  }}
                >
                  <CardContent>
                    <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                      "{selectedMessage.content}"
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar 
                            src={selectedMessage.sender.avatar}
                            sx={{ width: 40, height: 40 }}
                          >
                            {selectedMessage.sender.email.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              {selectedMessage.sender.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Expéditeur
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            <ChatIcon sx={{ color: theme.palette.primary.main }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              {selectedMessage.chatRoom.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Salon
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Chip
                        label={selectedMessage.isDeleted ? 'Supprimé' : 'Actif'}
                        sx={{ 
                          bgcolor: selectedMessage.isDeleted 
                            ? alpha(theme.palette.error.main, 0.1) 
                            : alpha(theme.palette.success.main, 0.1),
                          color: selectedMessage.isDeleted 
                            ? theme.palette.error.main 
                            : theme.palette.success.main,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
                
                {/* Informations détaillées */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      flex: 1,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom display="flex" alignItems="center" gap={1}>
                      <AccessTimeIcon fontSize="small" />
                      Informations temporelles
                    </Typography>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Créé le:</strong>{' '}
                        {dayjs(selectedMessage.createdAt).format('DD/MM/YYYY à HH:mm:ss')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Modifié le:</strong>{' '}
                        {dayjs(selectedMessage.updatedAt).format('DD/MM/YYYY à HH:mm:ss')}
                      </Typography>
                    </Box>
                  </Paper>
                  
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      flex: 1,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom display="flex" alignItems="center" gap={1}>
                      <TrendingUpIcon fontSize="small" />
                      Engagement
                    </Typography>
                    <Box display="flex" gap={3}>
                      <Box>
                        <Typography variant="h5" fontWeight="bold" color="error.main">
                          {selectedMessage.likes}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Likes
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h5" fontWeight="bold" color="info.main">
                          {selectedMessage.replies}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Réponses
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
                
                {/* Actions */}
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    mt: 2,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom display="flex" alignItems="center" gap={1}>
                    <WarningIcon fontSize="small" />
                    Actions
                  </Typography>
                  <Box display="flex" gap={2}>
                    {selectedMessage.isDeleted ? (
                      <Button
                        variant="contained"
                        startIcon={<RestoreIcon />}
                        onClick={() => {
                          handleToggleDelete(selectedMessage, true);
                          setDetailDialogOpen(false);
                        }}
                        sx={{ 
                          borderRadius: 3,
                          bgcolor: theme.palette.success.main,
                          '&:hover': {
                            bgcolor: theme.palette.success.dark,
                          }
                        }}
                      >
                        Restaurer le message
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                          handleToggleDelete(selectedMessage, false);
                          setDetailDialogOpen(false);
                        }}
                        sx={{ borderRadius: 3 }}
                      >
                        Supprimer le message
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Button 
                onClick={() => setDetailDialogOpen(false)}
                sx={{ borderRadius: 3 }}
              >
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default MessagesPage;