// pages/UsersPage.tsx
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
  DialogActions,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  alpha,
  useTheme,
  Fade,
  Slide,
  Grow,
  Tooltip,
  Avatar,
  AvatarGroup,
  InputAdornment,
  Divider,
  LinearProgress,
  useMediaQuery,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { userApi } from '../services/api/user';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  chatRooms?: number;
  messages?: number;
}

const UsersPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'email' | 'role' | 'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    isActive: true,
    password: '',
    role: 'USER' as 'USER' | 'ADMIN',
  });

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userApi.getAllUsers();
      if (response.data.success) {
        const usersData: User[] = (response.data.data || []).map((user: any) => ({
          ...user,
          avatar: `https://i.pravatar.cc/150?u=${user.id}`,
          chatRooms: Math.floor(Math.random() * 10),
          messages: Math.floor(Math.random() * 100),
          lastLogin: dayjs().subtract(Math.floor(Math.random() * 30), 'days').toISOString(),
        }));
        setUsers(usersData);
        
        toast.success(`${usersData.length} utilisateurs chargés`, {
          icon: '👥',
          style: {
            borderRadius: '10px',
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        });
      } else {
        setError(response.data.message || 'Erreur lors du chargement des utilisateurs');
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      setError(error.response?.data?.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && user.isActive) ||
      (statusFilter === 'INACTIVE' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  })
  .sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'email':
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
        break;
      case 'role':
        aValue = a.role;
        bValue = b.role;
        break;
      case 'date':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'status':
        aValue = a.isActive ? 1 : 0;
        bValue = b.isActive ? 1 : 0;
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

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDeleteClick = (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    setDeleteLoading(true);
    try {
      const response = await userApi.deleteUser(userToDelete.id);
      if (response.data.success) {
        toast.success('Utilisateur supprimé avec succès');
        setUsers(users.filter(u => u.id !== userToDelete.id));
      } else {
        toast.error(response.data.message || 'Erreur lors de la suppression');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Erreur de connexion au serveur');
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setEditForm({
      isActive: user.isActive,
      password: '',
      role: user.role,
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!userToEdit) return;
    
    try {
      const response = await userApi.updateUser(userToEdit.id, editForm);
      if (response.data.success) {
        toast.success('Utilisateur mis à jour avec succès');
        setUsers(users.map(u => 
          u.id === userToEdit.id ? { ...u, ...editForm } : u
        ));
        setEditDialogOpen(false);
        setUserToEdit(null);
      } else {
        toast.error(response.data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Erreur de connexion au serveur');
    }
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getUserStats = () => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'ADMIN').length;
    const active = users.filter(u => u.isActive).length;
    const inactive = total - active;
    
    return { total, admins, active, inactive };
  };

  const stats = getUserStats();

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
            Chargement des utilisateurs...
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
            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
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
              background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.secondary.main})`,
            }
          }}
        >
          <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'stretch' : 'center'} gap={3} mb={4}>
            <Box>
              <Typography variant="h2" fontWeight="800" gutterBottom sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Gestion des Utilisateurs
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                Gérez les comptes utilisateurs, modifiez les rôles et surveillez l'activité des membres.
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={loadUsers}
              sx={{
                borderRadius: 3,
                px: 3,
                background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.secondary.main} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.warning.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
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
                    <PersonIcon sx={{ color: theme.palette.primary.main }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Total Utilisateurs
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
                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                  borderRadius: 3,
                  flex: 1,
                  minWidth: 120,
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), width: 40, height: 40 }}>
                    <AdminPanelSettingsIcon sx={{ color: theme.palette.secondary.main }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Administrateurs
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h3" fontWeight="bold" color={theme.palette.secondary.main} lineHeight={1}>
                  {stats.admins}
                </Typography>
              </Paper>
            </Fade>
            
            <Fade in={true} style={{ transitionDelay: '200ms' }}>
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
                    <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Utilisateurs Actifs
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h3" fontWeight="bold" color={theme.palette.success.main} lineHeight={1}>
                  {stats.active}
                </Typography>
              </Paper>
            </Fade>
            
            <Fade in={true} style={{ transitionDelay: '300ms' }}>
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
                    <BlockIcon sx={{ color: theme.palette.error.main }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Comptes Inactifs
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h3" fontWeight="bold" color={theme.palette.error.main} lineHeight={1}>
                  {stats.inactive}
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
                placeholder="Rechercher par email..."
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
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel shrink>Rôle</InputLabel>
                <Select
                  value={roleFilter}
                  label="Rôle"
                  onChange={(e) => setRoleFilter(e.target.value)}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="ALL">
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <FilterIcon fontSize="small" />
                      Tous les rôles
                    </Box>
                  </MenuItem>
                  <MenuItem value="USER">
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <PersonIcon fontSize="small" />
                      USER
                    </Box>
                  </MenuItem>
                  <MenuItem value="ADMIN">
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <AdminPanelSettingsIcon fontSize="small" />
                      ADMIN
                    </Box>
                  </MenuItem>
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
                      Actif
                    </Box>
                  </MenuItem>
                  <MenuItem value="INACTIVE">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.error.main }} />
                      Inactif
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
                  <MenuItem value="email">Email (A-Z)</MenuItem>
                  <MenuItem value="role">Rôle</MenuItem>
                  <MenuItem value="date">Date d'inscription</MenuItem>
                  <MenuItem value="status">Statut</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon fontSize="small" />
              {filteredUsers.length} utilisateur(s) trouvé(s)
            </Typography>
          </Paper>
        </Paper>
      </Grow>

      {/* Tableau des utilisateurs */}
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
                bgcolor: alpha(theme.palette.warning.main, 0.02),
                '& th': {
                  borderBottom: `2px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                  fontWeight: 600,
                }
              }}>
                <TableCell>Utilisateur</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleSort('role')}
                    startIcon={<SecurityIcon />}
                    sx={{ 
                      fontWeight: '600',
                      color: 'text.primary',
                      textTransform: 'none',
                    }}
                  >
                    Rôle
                    {sortBy === 'role' && (
                      <Typography component="span" sx={{ ml: 0.5 }}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </Typography>
                    )}
                  </Button>
                </TableCell>
                <TableCell>Activité</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleSort('status')}
                    startIcon={<CheckCircleIcon />}
                    sx={{ 
                      fontWeight: '600',
                      color: 'text.primary',
                      textTransform: 'none',
                    }}
                  >
                    Statut
                    {sortBy === 'status' && (
                      <Typography component="span" sx={{ ml: 0.5 }}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </Typography>
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleSort('date')}
                    startIcon={<AccessTimeIcon />}
                    sx={{ 
                      fontWeight: '600',
                      color: 'text.primary',
                      textTransform: 'none',
                    }}
                  >
                    Inscription
                    {sortBy === 'date' && (
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
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <SearchIcon sx={{ fontSize: 80, color: alpha(theme.palette.text.secondary, 0.3), mb: 3 }} />
                      <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
                        Aucun utilisateur trouvé
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                        {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun utilisateur enregistré'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow 
                    key={user.id} 
                    hover
                    sx={{ 
                      '&:hover': { 
                        bgcolor: alpha(theme.palette.warning.main, 0.02) 
                      }
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar 
                          src={user.avatar}
                          sx={{ width: 48, height: 48 }}
                        >
                          {user.email.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight="600">
                            {user.email}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user.id}
                            </Typography>
                            {user.id === currentUser?.id && (
                              <Chip 
                                label="Vous" 
                                size="small" 
                                sx={{ 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  height: 20,
                                  fontSize: '0.7rem',
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={user.role === 'ADMIN' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                        label={user.role}
                        size="small"
                        sx={{ 
                          bgcolor: user.role === 'ADMIN' 
                            ? alpha(theme.palette.secondary.main, 0.1) 
                            : alpha(theme.palette.primary.main, 0.1),
                          color: user.role === 'ADMIN' 
                            ? theme.palette.secondary.main 
                            : theme.palette.primary.main,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={2}>
                        <Tooltip title="Salons">
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Typography variant="body2" color="primary.main" fontWeight="500">
                              {user.chatRooms}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              salons
                            </Typography>
                          </Box>
                        </Tooltip>
                        <Tooltip title="Messages">
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Typography variant="body2" color="info.main" fontWeight="500">
                              {user.messages}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              msgs
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={user.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                        label={user.isActive ? 'Actif' : 'Inactif'}
                        size="small"
                        sx={{ 
                          bgcolor: user.isActive 
                            ? alpha(theme.palette.success.main, 0.1) 
                            : alpha(theme.palette.error.main, 0.1),
                          color: user.isActive 
                            ? theme.palette.success.main 
                            : theme.palette.error.main,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          {dayjs(user.createdAt).format('DD/MM/YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                          <AccessTimeIcon sx={{ fontSize: 12 }} />
                          {dayjs(user.createdAt).fromNow()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(user)}
                            disabled={user.id === currentUser?.id}
                            sx={{ 
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.info.main, 0.2),
                              },
                              '&.Mui-disabled': {
                                bgcolor: alpha(theme.palette.action.disabled, 0.1),
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(user)}
                            disabled={user.id === currentUser?.id}
                            sx={{ 
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              color: theme.palette.error.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.2),
                              },
                              '&.Mui-disabled': {
                                bgcolor: alpha(theme.palette.action.disabled, 0.1),
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
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
        {filteredUsers.length > 0 && (
          <TablePagination
            component="div"
            count={filteredUsers.length}
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
            Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
            <strong>{userToDelete?.email}</strong> ?
          </Typography>
          
          <Alert 
            severity="warning" 
            icon={<WarningIcon />}
            sx={{ 
              mt: 2,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              bgcolor: alpha(theme.palette.warning.main, 0.05),
            }}
          >
            <Typography variant="body2">
              Cette action est irréversible. Toutes les données de cet utilisateur seront perdues.
            </Typography>
          </Alert>
          
          {userToDelete && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                • {userToDelete.chatRooms} salons créés
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {userToDelete.messages} messages envoyés
              </Typography>
            </Box>
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
              'Supprimer'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), width: 48, height: 48 }}>
              <EditIcon color="info" />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Modifier l'utilisateur
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userToEdit?.email}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ pt: 1 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar 
                src={userToEdit?.avatar}
                sx={{ width: 64, height: 64 }}
              >
                {userToEdit?.email.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="600">
                  {userToEdit?.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {userToEdit?.id}
                </Typography>
              </Box>
            </Box>
            
            <Box mb={3}>
              <Typography gutterBottom>Statut du compte:</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Actif"
                  clickable
                  color={editForm.isActive ? 'success' : 'default'}
                  variant={editForm.isActive ? 'filled' : 'outlined'}
                  onClick={() => setEditForm({ ...editForm, isActive: true })}
                  sx={{ borderRadius: 2 }}
                />
                <Chip
                  icon={<BlockIcon />}
                  label="Inactif"
                  clickable
                  color={!editForm.isActive ? 'error' : 'default'}
                  variant={!editForm.isActive ? 'filled' : 'outlined'}
                  onClick={() => setEditForm({ ...editForm, isActive: false })}
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            </Box>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={editForm.role}
                label="Rôle"
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'USER' | 'ADMIN' })}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="USER">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 32, height: 32 }}>
                      <PersonIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                    </Avatar>
                    <Box>
                      <Typography>Utilisateur</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Accès standard
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="ADMIN">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), width: 32, height: 32 }}>
                      <AdminPanelSettingsIcon fontSize="small" sx={{ color: theme.palette.secondary.main }} />
                    </Avatar>
                    <Box>
                      <Typography>Administrateur</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Accès complet
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Nouveau mot de passe"
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3 }
              }}
              helperText="Laissez vide pour ne pas changer le mot de passe (min. 6 caractères)"
            />
            
            <Alert 
              severity="info" 
              sx={{ 
                mt: 2,
                borderRadius: 3,
              }}
            >
              <Typography variant="body2">
                Seul le mot de passe, le statut et le rôle peuvent être modifiés.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            sx={{ 
              borderRadius: 3,
              px: 3,
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            disabled={editForm.password.length > 0 && editForm.password.length < 6}
            sx={{ 
              borderRadius: 3,
              px: 3,
              bgcolor: theme.palette.info.main,
              '&:hover': {
                bgcolor: theme.palette.info.dark,
              }
            }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersPage;