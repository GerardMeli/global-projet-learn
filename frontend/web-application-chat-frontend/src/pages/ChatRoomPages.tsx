// pages/ChatRoomsPage.tsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  CardActions,
  ToggleButton,
  ToggleButtonGroup,
  DialogActions,
  Tooltip,
  Avatar,
  Badge,
  InputAdornment,
  Divider,
  alpha,
  useTheme,
  Fade,
  Zoom,
  Grow,
  Slide,
  CardHeader,
  AvatarGroup,
  LinearProgress,
  useMediaQuery,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  People as PeopleIcon,
  Message as MessageIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Group as GroupIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Dashboard as DashboardIcon,
  FormatListBulleted as ListIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  FormatListBulleted,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  AccessTime as AccessTimeIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { chatApi } from '../services/api/chat';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);

interface ChatRoom {
  id: number;
  name: string;
  description?: string;
  type: 'PRIVATE' | 'GROUP' | 'PUBLIC' | string;
  participantCount: number;
  messageCount?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  isActive?: boolean;
  lastActivity?: string;
}

const ChatRoomsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'participants' | 'created' | 'updated'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<ChatRoom | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  
  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    type: 'GROUP' as 'PRIVATE' | 'GROUP' | 'PUBLIC',
  });
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<ChatRoom | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [stats, setStats] = useState({
    totalRooms: 0,
    privateRooms: 0,
    publicRooms: 0,
    totalParticipants: 0,
    activeRooms: 0,
    averageParticipants: 0,
  });

  const loadRooms = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await chatApi.getAllChatRooms();
      const roomsData: ChatRoom[] = response.data || [];
      setRooms(roomsData);
      
      const privateRooms = roomsData.filter(room => room.type === 'PRIVATE').length;
      const publicRooms = roomsData.filter(room => room.type === 'PUBLIC' || room.type === 'GROUP').length;
      const totalParticipants = roomsData.reduce((sum, room) => sum + (room.participantCount || 0), 0);
      const activeRooms = roomsData.filter(room => (room.participantCount || 0) > 0).length;
      const averageParticipants = roomsData.length > 0 ? totalParticipants / roomsData.length : 0;
      
      setStats({
        totalRooms: roomsData.length,
        privateRooms,
        publicRooms,
        totalParticipants,
        activeRooms,
        averageParticipants: parseFloat(averageParticipants.toFixed(1)),
      });
      
      toast.success(`${roomsData.length} salons chargés`, {
        icon: '🎉',
        style: {
          borderRadius: '10px',
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
        },
      });
    } catch (error: any) {
      console.error('Error loading rooms:', error);
      setError(error.response?.data?.message || 'Erreur de connexion au serveur');
      toast.error('Erreur lors du chargement des salons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const filteredRooms = rooms
    .filter(room => {
      const matchesSearch = 
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === 'ALL' || room.type === typeFilter;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'participants':
          aValue = a.participantCount || 0;
          bValue = b.participantCount || 0;
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updated':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
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

  const paginatedRooms = filteredRooms.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleOpenDialog = (room?: ChatRoom) => {
    if (room) {
      setEditingRoom(room);
      setRoomForm({
        name: room.name,
        description: room.description || '',
        type: room.type as 'PRIVATE' | 'GROUP' | 'PUBLIC',
      });
    } else {
      setEditingRoom(null);
      setRoomForm({
        name: '',
        description: '',
        type: 'GROUP',
      });
    }
    setDialogOpen(true);
  };

  const handleSaveRoom = async () => {
    if (!roomForm.name.trim()) {
      toast.error('Le nom du salon est requis');
      return;
    }

    setDialogLoading(true);
    try {
      if (editingRoom) {
        const response = await chatApi.updateChatRoom(editingRoom.id, {
          name: roomForm.name,
          description: roomForm.description || undefined,
          type: roomForm.type,
        });
        
        setRooms(prevRooms =>
          prevRooms.map(room =>
            room.id === editingRoom.id ? response.data : room
          )
        );
        toast.success('Salon mis à jour avec succès');
      } else {
        const response = await chatApi.createChatRoom({
          name: roomForm.name,
          description: roomForm.description || undefined,
          type: roomForm.type,
        });
        
        setRooms(prevRooms => [...prevRooms, response.data]);
        toast.success('Salon créé avec succès');
      }
      
      setDialogOpen(false);
      setEditingRoom(null);
      setRoomForm({ name: '', description: '', type: 'GROUP' });
      
    } catch (error: any) {
      console.error('Error saving room:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDeleteClick = (room: ChatRoom) => {
    setRoomToDelete(room);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return;
    
    setDeleteLoading(true);
    try {
      await chatApi.deleteChatRoom(roomToDelete.id);
      
      setRooms(prevRooms => prevRooms.filter(room => room.id !== roomToDelete.id));
      toast.success('Salon supprimé avec succès');
      
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
      
    } catch (error: any) {
      console.error('Error deleting room:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleJoinRoom = (roomId: number) => {
    navigate(`/chat/${roomId}`);
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle,
    trend
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    color: string; 
    subtitle?: string;
    trend?: number;
  }) => (
    <Fade in={true}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          bgcolor: alpha(color, 0.05),
          border: `1px solid ${alpha(color, 0.1)}`,
          borderRadius: 3,
          flex: 1,
          minWidth: 120,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px ${alpha(color, 0.15)}`,
          }
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <Avatar sx={{ bgcolor: alpha(color, 0.1), width: 40, height: 40 }}>
                <Icon sx={{ color }} />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  {title}
                </Typography>
                {trend !== undefined && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <TrendingUpIcon sx={{ fontSize: 14, color: trend >= 0 ? theme.palette.success.main : theme.palette.error.main }} />
                    <Typography variant="caption" color={trend >= 0 ? 'success.main' : 'error.main'}>
                      {trend > 0 ? '+' : ''}{trend}%
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
            <Typography variant="h3" fontWeight="bold" color={color} lineHeight={1}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Fade>
  );

  const RoomCard = ({ room }: { room: ChatRoom }) => (
    <Zoom in={true}>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
          },
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: room.type === 'PRIVATE' 
              ? `linear-gradient(90deg, ${theme.palette.error.main}, ${alpha(theme.palette.error.main, 0.5)})`
              : `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.5)})`,
          }
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              sx={{
                bgcolor: room.type === 'PRIVATE' 
                  ? alpha(theme.palette.error.main, 0.1) 
                  : alpha(theme.palette.primary.main, 0.1),
                color: room.type === 'PRIVATE' 
                  ? theme.palette.error.main 
                  : theme.palette.primary.main,
                width: 48,
                height: 48,
              }}
            >
              {room.type === 'PRIVATE' ? <LockIcon /> : <GroupIcon />}
            </Avatar>
          }
          action={
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          }
          title={
            <Typography variant="h6" fontWeight="600" noWrap>
              {room.name}
            </Typography>
          }
          subheader={
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={room.type === 'PRIVATE' ? 'Privé' : 'Public'}
                size="small"
                color={room.type === 'PRIVATE' ? 'error' : 'primary'}
                variant="filled"
                sx={{ 
                  bgcolor: room.type === 'PRIVATE' 
                    ? alpha(theme.palette.error.main, 0.1) 
                    : alpha(theme.palette.primary.main, 0.1),
                  color: room.type === 'PRIVATE' 
                    ? theme.palette.error.main 
                    : theme.palette.primary.main,
                  fontWeight: 500,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                ID: {room.id}
              </Typography>
            </Box>
          }
          sx={{ pb: 1 }}
        />
        
        <CardContent sx={{ flexGrow: 1, pt: 0 }}>
          {room.description && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.6,
              }}
            >
              {room.description}
            </Typography>
          )}
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" gap={3}>
              <Tooltip title="Participants">
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                    <PeopleIcon sx={{ fontSize: 16, color: theme.palette.info.main }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      {room.participantCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Participants
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
              
              {room.messageCount !== undefined && (
                <Tooltip title="Messages">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                      <MessageIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        {room.messageCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Messages
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>
              )}
            </Box>
            
            <Tooltip title={dayjs(room.createdAt).format('DD/MM/YYYY HH:mm')}>
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {dayjs(room.createdAt).fromNow()}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
          
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Activité
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={Math.min((room.participantCount / 100) * 100, 100)} 
              sx={{ 
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: room.participantCount > 50 
                    ? theme.palette.success.main 
                    : room.participantCount > 20 
                      ? theme.palette.warning.main 
                      : theme.palette.info.main,
                }
              }}
            />
          </Box>
        </CardContent>
        
        <Divider />
        
        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => handleJoinRoom(room.id)}
            sx={{ 
              borderRadius: 2,
              px: 2,
              bgcolor: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              }
            }}
          >
            Rejoindre
          </Button>
          
          <Box display="flex" gap={1}>
            <Tooltip title="Modifier">
              <IconButton
                size="small"
                onClick={() => handleOpenDialog(room)}
                sx={{ 
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.info.main, 0.2),
                  }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer">
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(room)}
                sx={{ 
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.2),
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </CardActions>
      </Card>
    </Zoom>
  );

  if (loading && rooms.length === 0) {
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
            Chargement des salons...
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
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
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
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }
          }}
        >
          <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'stretch' : 'center'} gap={3} mb={4}>
            <Box>
              <Typography variant="h2" fontWeight="800" gutterBottom sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Gestion des Salons
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                Gérez tous les salons de discussion, créez de nouveaux espaces de conversation et modifiez les paramètres existants.
              </Typography>
            </Box>
            
            <Box display="flex" gap={2} flexDirection={isMobile ? 'column' : 'row'}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadRooms}
                sx={{ 
                  borderRadius: 3,
                  px: 3,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }
                }}
              >
                Actualiser
              </Button>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  }
                }}
              >
                Nouveau Salon
              </Button>
            </Box>
          </Box>
          
          {/* Statistiques */}
          <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
            <StatCard
              title="Total Salons"
              value={stats.totalRooms}
              icon={DashboardIcon}
              color={theme.palette.primary.main}
              subtitle="espaces actifs"
              trend={12}
            />
            
            <StatCard
              title="Salons Publics"
              value={stats.publicRooms}
              icon={PublicIcon}
              color={theme.palette.success.main}
              subtitle="accessibles à tous"
              trend={8}
            />
            
            <StatCard
              title="Salons Privés"
              value={stats.privateRooms}
              icon={LockIcon}
              color={theme.palette.error.main}
              subtitle="accès restreint"
              trend={-3}
            />
            
            <StatCard
              title="Participants"
              value={stats.totalParticipants}
              icon={PeopleIcon}
              color={theme.palette.warning.main}
              subtitle="utilisateurs actifs"
              trend={24}
            />
            
            <StatCard
              title="Actifs"
              value={stats.activeRooms}
              icon={MessageIcon}
              color={theme.palette.info.main}
              subtitle="avec activité récente"
              trend={15}
            />
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
                action={
                  <Button color="inherit" size="small" onClick={() => setError(null)}>
                    Ignorer
                  </Button>
                }
              >
                {error}
              </Alert>
            </Slide>
          )}
          
          {/* Barre de contrôle */}
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
            <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
              <TextField
                placeholder="Rechercher un salon..."
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
                sx={{ 
                  flex: 1,
                  minWidth: 200,
                }}
              />
              
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel shrink>Type de salon</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type de salon"
                  onChange={(e) => setTypeFilter(e.target.value)}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="ALL">
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <FilterIcon fontSize="small" />
                      Tous les types
                    </Box>
                  </MenuItem>
                  <MenuItem value="PUBLIC">
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <PublicIcon fontSize="small" color="success" />
                      Public
                    </Box>
                  </MenuItem>
                  <MenuItem value="PRIVATE">
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <LockIcon fontSize="small" color="error" />
                      Privé
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
                  <MenuItem value="name">Nom (A-Z)</MenuItem>
                  <MenuItem value="participants">Participants (↑↓)</MenuItem>
                  <MenuItem value="created">Date de création</MenuItem>
                  <MenuItem value="updated">Dernière activité</MenuItem>
                </Select>
              </FormControl>
              
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
                sx={{ 
                  borderRadius: 3,
                  '& .MuiToggleButton-root': {
                    borderRadius: '12px !important',
                    borderColor: alpha(theme.palette.divider, 0.2),
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    }
                  }
                }}
              >
                <ToggleButton value="list" title="Vue liste">
                  <ListIcon />
                </ToggleButton>
                <ToggleButton value="grid" title="Vue grille">
                  <DashboardIcon />
                </ToggleButton>
                <ToggleButton value="compact" title="Vue compacte">
                  <FormatListBulleted />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon fontSize="small" />
              {filteredRooms.length} salon(s) trouvé(s)
              {searchTerm && ` pour "${searchTerm}"`}
            </Typography>
          </Paper>
        </Paper>
      </Grow>

      {/* Vue grille */}
      {viewMode === 'grid' && (
        <Box
          display="flex"
          flexWrap="wrap"
          gap={3}
        >
          {paginatedRooms.map((room, index) => (
            <Slide direction="up" in={true} timeout={index * 100} key={room.id}>
              <Box
                flex={`1 1 ${isMobile ? '100%' : isTablet ? 'calc(50% - 12px)' : 'calc(33.333% - 16px)'}`}
                minWidth={isMobile ? '100%' : '280px'}
              >
                <RoomCard room={room} />
              </Box>
            </Slide>
          ))}
        </Box>
      )}

      {/* Vue liste */}
      {viewMode === 'list' && (
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
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  '& th': {
                    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    fontWeight: 600,
                  }
                }}>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleSort('name')}
                      startIcon={<SortIcon />}
                      sx={{ 
                        fontWeight: '600',
                        color: 'text.primary',
                        textTransform: 'none',
                      }}
                    >
                      Nom
                      {sortBy === 'name' && (
                        <Typography component="span" sx={{ ml: 0.5 }}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </Typography>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleSort('participants')}
                      startIcon={<PeopleIcon />}
                      sx={{ 
                        fontWeight: '600',
                        color: 'text.primary',
                        textTransform: 'none',
                      }}
                    >
                      Participants
                      {sortBy === 'participants' && (
                        <Typography component="span" sx={{ ml: 0.5 }}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </Typography>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleSort('created')}
                      startIcon={<CalendarIcon />}
                      sx={{ 
                        fontWeight: '600',
                        color: 'text.primary',
                        textTransform: 'none',
                      }}
                    >
                      Créé le
                      {sortBy === 'created' && (
                        <Typography component="span" sx={{ ml: 0.5 }}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </Typography>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {paginatedRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <SearchIcon sx={{ fontSize: 80, color: alpha(theme.palette.text.secondary, 0.3), mb: 3 }} />
                        <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
                          Aucun salon trouvé
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                          {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Commencez par créer votre premier salon de discussion'}
                        </Typography>
                        {!searchTerm && (
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{ 
                              borderRadius: 3,
                              px: 4,
                              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            }}
                          >
                            Créer un salon
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRooms.map((room) => (
                    <TableRow 
                      key={room.id} 
                      hover
                      sx={{ 
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.primary.main, 0.02) 
                        },
                        '&:last-child td': {
                          borderBottom: 0,
                        }
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            sx={{
                              bgcolor: room.type === 'PRIVATE' 
                                ? alpha(theme.palette.error.main, 0.1) 
                                : alpha(theme.palette.primary.main, 0.1),
                              color: room.type === 'PRIVATE' 
                                ? theme.palette.error.main 
                                : theme.palette.primary.main,
                              width: 48,
                              height: 48,
                            }}
                          >
                            {room.type === 'PRIVATE' ? <LockIcon /> : <GroupIcon />}
                          </Avatar>
                          <Box>
                            <Typography fontWeight="600" fontSize="1.1rem">
                              {room.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                              <SettingsIcon sx={{ fontSize: 12 }} />
                              ID: {room.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 250 }}>
                          {room.description || '—'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={room.type === 'PRIVATE' ? <LockIcon /> : <PublicIcon />}
                          label={room.type === 'PRIVATE' ? 'Privé' : 'Public'}
                          size="small"
                          sx={{ 
                            bgcolor: room.type === 'PRIVATE' 
                              ? alpha(theme.palette.error.main, 0.1) 
                              : alpha(theme.palette.primary.main, 0.1),
                            color: room.type === 'PRIVATE' 
                              ? theme.palette.error.main 
                              : theme.palette.primary.main,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PeopleIcon sx={{ color: theme.palette.info.main }} />
                            <Typography fontWeight="600">
                              {room.participantCount}
                            </Typography>
                          </Box>
                          {room.messageCount !== undefined && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <MessageIcon sx={{ color: theme.palette.success.main }} />
                              <Typography fontWeight="600">
                                {room.messageCount}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {dayjs(room.createdAt).format('DD/MM/YYYY')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                            <AccessTimeIcon sx={{ fontSize: 12 }} />
                            {dayjs(room.createdAt).fromNow()}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title="Rejoindre">
                            <IconButton
                              size="small"
                              sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                }
                              }}
                              onClick={() => handleJoinRoom(room.id)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              sx={{ 
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: theme.palette.info.main,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.info.main, 0.2),
                                }
                              }}
                              onClick={() => handleOpenDialog(room)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
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
                              onClick={() => handleDeleteClick(room)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          {filteredRooms.length > 0 && (
            <TablePagination
              component="div"
              count={filteredRooms.length}
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
      )}

      {/* Vue compacte */}
      {viewMode === 'compact' && (
        <Box display="flex" flexDirection="column" gap={2}>
          {paginatedRooms.map((room, index) => (
            <Slide direction="up" in={true} timeout={index * 50} key={room.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={2.5} flex={1}>
                    <Avatar 
                      sx={{ 
                        width: 40, 
                        height: 40,
                        bgcolor: room.type === 'PRIVATE' 
                          ? alpha(theme.palette.error.main, 0.1) 
                          : alpha(theme.palette.primary.main, 0.1),
                        color: room.type === 'PRIVATE' 
                          ? theme.palette.error.main 
                          : theme.palette.primary.main,
                      }}
                    >
                      {room.type === 'PRIVATE' ? <LockIcon /> : <GroupIcon />}
                    </Avatar>
                    
                    <Box flex={1} minWidth={0}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                        <Typography variant="subtitle1" fontWeight="600" noWrap>
                          {room.name}
                        </Typography>
                        <Chip
                          label={room.type === 'PRIVATE' ? 'Privé' : 'Public'}
                          size="small"
                          sx={{ 
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: room.type === 'PRIVATE' 
                              ? alpha(theme.palette.error.main, 0.1) 
                              : alpha(theme.palette.primary.main, 0.1),
                            color: room.type === 'PRIVATE' 
                              ? theme.palette.error.main 
                              : theme.palette.primary.main,
                          }}
                        />
                      </Box>
                      {room.description && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                          {room.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={3}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PeopleIcon fontSize="small" sx={{ color: theme.palette.info.main }} />
                        <Typography variant="body2" fontWeight="600">
                          {room.participantCount}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        |
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                        {dayjs(room.createdAt).fromNow()}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" gap={1}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleJoinRoom(room.id)}
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(room)}
                        sx={{ 
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteClick(room)}
                        sx={{ 
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          color: theme.palette.error.main,
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Slide>
          ))}
        </Box>
      )}

      {/* Dialog création/édition */}
      <Dialog
        open={dialogOpen}
        onClose={() => !dialogLoading && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Typography variant="h5" fontWeight="bold" display="flex" alignItems="center" gap={1}>
            {editingRoom ? (
              <>
                <EditIcon color="info" />
                Modifier le salon
              </>
            ) : (
              <>
                <AddIcon color="primary" />
                Nouveau salon
              </>
            )}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Nom du salon"
              value={roomForm.name}
              onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
              required
              sx={{ mb: 3 }}
              InputProps={{ 
                sx: { borderRadius: 3 },
                startAdornment: (
                  <InputAdornment position="start">
                    <GroupIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="Description"
              value={roomForm.description}
              onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
              multiline
              rows={3}
              sx={{ mb: 3 }}
              InputProps={{ sx: { borderRadius: 3 } }}
              helperText="Optionnel - Décrivez le sujet ou le but de ce salon"
            />
            
            <FormControl fullWidth sx={{ mb: 1 }}>
              <InputLabel>Type de salon</InputLabel>
              <Select
                value={roomForm.type}
                label="Type de salon"
                onChange={(e) => setRoomForm({ 
                  ...roomForm, 
                  type: e.target.value as 'PRIVATE' | 'GROUP' | 'PUBLIC'
                })}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="PUBLIC">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), width: 32, height: 32 }}>
                      <PublicIcon fontSize="small" color="success" />
                    </Avatar>
                    <Box>
                      <Typography>Public</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Accessible à tous les utilisateurs
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="PRIVATE">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), width: 32, height: 32 }}>
                      <LockIcon fontSize="small" color="error" />
                    </Avatar>
                    <Box>
                      <Typography>Privé</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Accès limité aux membres invités
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={dialogLoading}
            sx={{ 
              borderRadius: 3,
              px: 3,
              borderColor: alpha(theme.palette.divider, 0.5),
            }}
            variant="outlined"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSaveRoom}
            variant="contained"
            disabled={dialogLoading || !roomForm.name.trim()}
            sx={{ 
              borderRadius: 3,
              px: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }}
          >
            {dialogLoading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : editingRoom ? (
              'Mettre à jour'
            ) : (
              'Créer le salon'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { 
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), width: 48, height: 48 }}>
              <WarningIcon color="error" />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Confirmer la suppression
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Action irréversible
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Typography paragraph>
            Êtes-vous sûr de vouloir supprimer le salon{' '}
            <strong>"{roomToDelete?.name}"</strong> ?
          </Typography>
          
          <Alert 
            severity="warning" 
            icon={<InfoIcon />}
            sx={{ 
              mt: 2,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              bgcolor: alpha(theme.palette.warning.main, 0.05),
            }}
          >
            <Typography variant="body2">
              Cette action est irréversible. Tous les messages, participants et données associées à ce salon seront définitivement supprimés.
            </Typography>
          </Alert>
          
          {roomToDelete && roomToDelete.participantCount > 0 && (
            <Alert 
              severity="info"
              sx={{ 
                mt: 2,
                borderRadius: 3,
              }}
            >
              <Typography variant="body2">
                <strong>Attention:</strong> Ce salon contient actuellement {roomToDelete.participantCount} participant(s).
              </Typography>
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
            sx={{ 
              borderRadius: 3,
              px: 3,
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            sx={{ 
              borderRadius: 3,
              px: 3,
              bgcolor: theme.palette.error.main,
              '&:hover': {
                bgcolor: theme.palette.error.dark,
              }
            }}
          >
            {deleteLoading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Supprimer définitivement'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChatRoomsPage;