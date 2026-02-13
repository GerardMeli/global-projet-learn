// pages/AdminDashboard.tsx - DESIGN UPGRADED VERSION WITH BOX
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  CardHeader,
  Avatar,
  Divider,
  Tooltip,
  Skeleton,
  LinearProgress,
  Fade,
  alpha,
  useTheme,
  styled,
} from '@mui/material';
import {
  People as PeopleIcon,
  Chat as ChatIcon,
  Message as MessageIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  East as EastIcon,
  Timeline as TimelineIcon,
  RocketLaunch as RocketIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { userApi } from '../services/api/user';
import { chatApi, type ChatRoomResponse } from '../services/api/chat';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAuth } from '../contexts/AuthContext';

dayjs.extend(relativeTime);

// Styled Components
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: theme.palette.background.paper,
  borderRadius: 16,
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const DashboardHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: 24,
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

// Types remain the same
interface User {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalRooms: number;
  totalMessages: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  userGrowthRate: number;
  roomGrowthRate: number;
  activeRooms: number;
}

interface RecentUser {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  isActive: boolean;
  lastActivity?: string;
}

interface RecentRoom {
  id: number;
  name: string;
  type: string;
  participantCount: number;
  messageCount?: number;
  createdAt: string;
  lastActivity?: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRooms: 0,
    totalMessages: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    userGrowthRate: 0,
    roomGrowthRate: 0,
    activeRooms: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentRooms, setRecentRooms] = useState<RecentRoom[]>([]);

  // Load data function remains exactly the same
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      
      const usersResponse = await userApi.getAllUsers();
      const users: User[] = usersResponse.data?.data || usersResponse.data || [];
      
      const roomsResponse = await chatApi.getAllChatRooms();
      const rooms: ChatRoomResponse[] = roomsResponse.data || [];
      
      const today = dayjs().startOf('day');
      const weekStart = dayjs().startOf('week');
      
      const newUsersToday = users.filter(u => 
        dayjs(u.createdAt).isAfter(today)
      ).length;
      
      const newUsersThisWeek = users.filter(u => 
        dayjs(u.createdAt).isAfter(weekStart)
      ).length;
      
      const activeUsers = users.filter(u => u.isActive).length;
      
      const lastWeekStart = dayjs().subtract(1, 'week').startOf('week');
      const lastWeekEnd = dayjs().subtract(1, 'week').endOf('week');
      
      const usersLastWeek = users.filter(u => {
        const date = dayjs(u.createdAt);
        return date.isAfter(lastWeekStart) && date.isBefore(lastWeekEnd);
      }).length;
      
      const userGrowthRate = usersLastWeek > 0 
        ? ((newUsersThisWeek - usersLastWeek) / usersLastWeek) * 100 
        : newUsersThisWeek > 0 ? 100 : 0;
      
      const newRoomsThisWeek = rooms.filter(r => 
        dayjs(r.createdAt).isAfter(weekStart)
      ).length;
      
      const roomsLastWeek = rooms.filter(r => {
        const date = dayjs(r.createdAt);
        return date.isAfter(lastWeekStart) && date.isBefore(lastWeekEnd);
      }).length;
      
      const roomGrowthRate = roomsLastWeek > 0 
        ? ((newRoomsThisWeek - roomsLastWeek) / roomsLastWeek) * 100 
        : newRoomsThisWeek > 0 ? 100 : 0;
      
      let totalMessages = 0;
      const activeRooms = rooms.filter(room => {
        return (room.participantCount || 0) > 0;
      }).length;
      
      setStats({
        totalUsers: users.length,
        totalRooms: rooms.length,
        totalMessages,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
        userGrowthRate: parseFloat(userGrowthRate.toFixed(1)),
        roomGrowthRate: parseFloat(roomGrowthRate.toFixed(1)),
        activeRooms,
      });
      
      const sortedUsers = [...users]
        .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
        .slice(0, 8);
      
      setRecentUsers(
        sortedUsers.map(u => ({
          id: u.id,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          isActive: u.isActive,
          lastActivity: u.lastLogin,
        }))
      );
      
      const sortedRooms = [...rooms]
        .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
        .slice(0, 8);
      
      setRecentRooms(
        sortedRooms.map(room => ({
          id: room.id,
          name: room.name,
          type: room.type || 'PUBLIC',
          participantCount: room.participantCount || 0,
          createdAt: room.createdAt,
        }))
      );
      
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadDashboardData();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Enhanced StatCard component
  const EnhancedStatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend,
    subtitle,
    loading: cardLoading,
    progress
  }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    color: string; 
    trend?: number;
    subtitle?: string;
    loading?: boolean;
    progress?: number;
  }) => (
    <StatCard>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: 56,
              height: 56,
              boxShadow: `0 8px 24px ${alpha(color, 0.2)}`,
            }}
          >
            <Icon sx={{ fontSize: 28 }} />
          </Avatar>
          
          {trend !== undefined && !cardLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend >= 0 ? (
                <ArrowUpwardIcon sx={{ color: theme.palette.success.main, fontSize: 18 }} />
              ) : (
                <ArrowDownwardIcon sx={{ color: theme.palette.error.main, fontSize: 18 }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: trend >= 0 ? theme.palette.success.main : theme.palette.error.main,
                }}
              >
                {trend >= 0 ? '+' : ''}{trend}%
              </Typography>
            </Box>
          )}
        </Box>
        
        {cardLoading ? (
          <>
            <Skeleton variant="rounded" width="80%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={24} />
          </>
        ) : (
          <>
            <Typography variant="h2" component="div" sx={{ fontWeight: 800, mb: 1 }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                {subtitle}
              </Typography>
            )}
            
            {progress !== undefined && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: alpha(color, 0.1),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: color,
                      borderRadius: 3,
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </CardContent>
    </StatCard>
  );

  // Enhanced Table Components
  const EnhancedUserRow = ({ user }: { user: RecentUser }) => (
    <TableRow 
      hover
      sx={{ 
        '&:last-child td, &:last-child th': { border: 0 },
        transition: 'all 0.2s ease',
        '&:hover': { 
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        }
      }}
    >
      <TableCell sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: user.role === 'ADMIN' 
                ? alpha(theme.palette.secondary.main, 0.1)
                : alpha(theme.palette.primary.main, 0.1),
              color: user.role === 'ADMIN' 
                ? theme.palette.secondary.main
                : theme.palette.primary.main,
            }}
          >
            {user.role === 'ADMIN' ? <AdminIcon /> : <PersonIcon />}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {user.email}
            </Typography>
            {user.lastActivity && (
              <Typography variant="caption" color="text.secondary">
                Actif {dayjs(user.lastActivity).fromNow()}
              </Typography>
            )}
          </Box>
        </Box>
      </TableCell>
      
      <TableCell sx={{ py: 2 }}>
        <Chip
          label={user.role}
          size="small"
          sx={{
            bgcolor: user.role === 'ADMIN' 
              ? alpha(theme.palette.secondary.main, 0.1)
              : alpha(theme.palette.primary.main, 0.1),
            color: user.role === 'ADMIN' 
              ? theme.palette.secondary.main
              : theme.palette.primary.main,
            fontWeight: 600,
            borderRadius: 1,
          }}
        />
      </TableCell>
      
      <TableCell sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: user.isActive ? theme.palette.success.main : theme.palette.error.main,
              animation: user.isActive ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              }
            }}
          />
          <Typography variant="body2">
            {user.isActive ? 'Actif' : 'Inactif'}
          </Typography>
        </Box>
      </TableCell>
      
      <TableCell sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {dayjs(user.createdAt).format('DD/MM/YY')}
        </Typography>
      </TableCell>
      
      <TableCell align="right" sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Tooltip title="Voir le profil">
            <IconButton
              size="small"
              onClick={() => navigate(`/users/${user.id}`)}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Modifier">
            <IconButton
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.grey[500], 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.2) }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );

  const handleViewUser = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  const handleViewRoom = (roomId: number) => {
    navigate(`/chat/${roomId}`);
  };

  const handleManageUsers = () => {
    navigate('/users');
  };

  const handleCreateUser = () => {
    toast.success('Création d\'utilisateur - Fonctionnalité à venir');
  };

  const handleExportData = () => {
    toast.success('Export des données - Fonctionnalité à venir');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <DashboardHeader>
          <Skeleton variant="text" width="40%" height={48} sx={{ bgcolor: alpha('#fff', 0.3) }} />
          <Skeleton variant="text" width="30%" height={24} sx={{ bgcolor: alpha('#fff', 0.3) }} />
        </DashboardHeader>
        
        {/* Stats loading with Box */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 4,
          '& > *': {
            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)', lg: 'calc(20% - 19.2px)' }
          }
        }}>
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} variant="rounded" height={180} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
        
        {/* Main content loading */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
          <Box sx={{ width: { xs: '100%', lg: '50%' } }}>
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
          </Box>
          <Box sx={{ width: { xs: '100%', lg: '50%' } }}>
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Fade in={!loading}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Enhanced Header */}
        <DashboardHeader>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <RocketIcon sx={{ fontSize: 32, opacity: 0.9 }} />
                <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
                  Tableau de bord
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
                Bienvenue dans votre espace d'administration • {user?.email}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={<SpeedIcon />}
                  label={`Dernière mise à jour: ${dayjs().format('HH:mm:ss')}`}
                  sx={{
                    bgcolor: alpha('#fff', 0.15),
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
                <Chip
                  icon={refreshing ? <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircleIcon />}
                  label={refreshing ? 'Actualisation...' : 'Synchronisé'}
                  sx={{
                    bgcolor: alpha(refreshing ? theme.palette.warning.main : theme.palette.success.main, 0.2),
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Actualiser">
                <IconButton
                  onClick={loadDashboardData}
                  disabled={refreshing}
                  sx={{
                    color: 'white',
                    bgcolor: alpha('#fff', 0.15),
                    '&:hover': { 
                      bgcolor: alpha('#fff', 0.25),
                      transform: 'rotate(45deg)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              
              <ActionButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateUser}
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.95),
                    boxShadow: `0 8px 24px ${alpha('#000', 0.2)}`,
                  }
                }}
              >
                Nouveau
              </ActionButton>
            </Box>
          </Box>
        </DashboardHeader>

        {/* Enhanced Stats with Box */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 4,
          '& > *': {
            width: { 
              xs: '100%', 
              sm: 'calc(50% - 12px)', 
              md: 'calc(33.333% - 16px)', 
              lg: 'calc(20% - 19.2px)' 
            }
          }
        }}>
          <EnhancedStatCard
            title="Utilisateurs totaux"
            value={stats.totalUsers}
            icon={PeopleIcon}
            color={theme.palette.primary.main}
            trend={stats.userGrowthRate}
            subtitle={`+${stats.newUsersToday} aujourd'hui`}
            progress={Math.min((stats.activeUsers / stats.totalUsers) * 100, 100)}
          />
          
          <EnhancedStatCard
            title="Utilisateurs actifs"
            value={stats.activeUsers}
            icon={TrendingUpIcon}
            color={theme.palette.success.main}
            subtitle={`${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% du total`}
            progress={Math.min((stats.activeUsers / stats.totalUsers) * 100, 100)}
          />
          
          <EnhancedStatCard
            title="Nouveaux cette semaine"
            value={stats.newUsersThisWeek}
            icon={PeopleIcon}
            color={theme.palette.warning.main}
            subtitle={`Soit ${Math.round((stats.newUsersThisWeek / 7))}/jour en moyenne`}
          />
          
          <EnhancedStatCard
            title="Salons de chat"
            value={stats.totalRooms}
            icon={ChatIcon}
            color={theme.palette.secondary.main}
            trend={stats.roomGrowthRate}
            subtitle={`${stats.activeRooms} actifs`}
            progress={Math.min((stats.activeRooms / stats.totalRooms) * 100, 100)}
          />
          
          <EnhancedStatCard
            title="Messages envoyés"
            value={stats.totalMessages.toLocaleString()}
            icon={MessageIcon}
            color={theme.palette.error.main}
            subtitle="Total cumulé"
          />
        </Box>

        {/* Main Content with Box */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: 3,
          mb: 3
        }}>
          {/* Recent Users Card */}
          <Box sx={{ width: { xs: '100%', lg: '50%' } }}>
            <GradientCard sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PeopleIcon sx={{ color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Utilisateurs récents
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Derniers inscrits sur la plateforme
                      </Typography>
                    </Box>
                  </Box>
                }
                action={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Filtrer">
                      <IconButton size="small">
                        <FilterIcon />
                      </IconButton>
                    </Tooltip>
                    <ActionButton
                      size="small"
                      endIcon={<EastIcon />}
                      onClick={handleManageUsers}
                    >
                      Tout voir
                    </ActionButton>
                  </Box>
                }
              />
              
              <Divider sx={{ opacity: 0.5 }} />
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Utilisateur</TableCell>
                      <TableCell>Rôle</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Inscription</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <EnhancedUserRow key={user.id} user={user} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button
                  variant="text"
                  endIcon={<EastIcon />}
                  onClick={handleManageUsers}
                  sx={{ fontWeight: 600 }}
                >
                  Voir tous les utilisateurs
                </Button>
              </Box>
            </GradientCard>
          </Box>

          {/* Recent Rooms Card */}
          <Box sx={{ width: { xs: '100%', lg: '50%' } }}>
            <GradientCard sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ChatIcon sx={{ color: theme.palette.secondary.main }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Salons récents
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Nouveaux salons de discussion
                      </Typography>
                    </Box>
                  </Box>
                }
                action={
                  <ActionButton
                    size="small"
                    endIcon={<EastIcon />}
                    onClick={() => navigate('/chat')}
                  >
                    Explorer
                  </ActionButton>
                }
              />
              
              <Divider sx={{ opacity: 0.5 }} />
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom du salon</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Participants</TableCell>
                      <TableCell>Création</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentRooms.map((room) => (
                      <TableRow 
                        key={room.id}
                        hover
                        sx={{ 
                          transition: 'all 0.2s ease',
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.secondary.main, 0.04),
                          }
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                            <Typography variant="body2" fontWeight={600}>
                              {room.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell sx={{ py: 2 }}>
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
                              fontWeight: 600,
                              borderRadius: 1,
                            }}
                          />
                        </TableCell>
                        
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PeopleIcon fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight={600}>
                              {room.participantCount}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {dayjs(room.createdAt).format('DD/MM/YY')}
                          </Typography>
                        </TableCell>
                        
                        <TableCell align="right" sx={{ py: 2 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewRoom(room.id)}
                            sx={{
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              '&:hover': { 
                                bgcolor: alpha(theme.palette.secondary.main, 0.2),
                              }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </GradientCard>
          </Box>
        </Box>

        {/* Quick Actions & Insights with Box */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 3 
        }}>
          {/* Insights Card */}
          <Box sx={{ width: { xs: '100%', md: '66.666%' } }}>
            <Card sx={{ borderRadius: 3, overflow: 'hidden', height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TimelineIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                      Insights et métriques
                    </Typography>
                  </Box>
                }
                subheader="Aperçu des performances de la plateforme"
              />
              
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: 3,
                  '& > *': {
                    width: { xs: 'calc(50% - 12px)', sm: 'calc(25% - 18px)' }
                  }
                }}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" color="primary" fontWeight={800}>
                      {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Taux d'engagement
                    </Typography>
                  </Paper>
                  
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" color="secondary" fontWeight={800}>
                      {stats.userGrowthRate >= 0 ? '+' : ''}{stats.userGrowthRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Croissance utilisateurs
                    </Typography>
                  </Paper>
                  
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" color="success.main" fontWeight={800}>
                      {stats.activeRooms}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Communautés actives
                    </Typography>
                  </Paper>
                  
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" color="warning.main" fontWeight={800}>
                      {stats.newUsersToday}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Nouveaux aujourd'hui
                    </Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          {/* Quick Actions Card */}
          <Box sx={{ width: { xs: '100%', md: '33.333%' } }}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardHeader
                title={
                  <Typography variant="h6" fontWeight={700}>
                    Actions rapides
                  </Typography>
                }
                subheader="Accès direct aux fonctionnalités"
              />
              
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <ActionButton
                    fullWidth
                    variant="contained"
                    startIcon={<PeopleIcon />}
                    onClick={handleManageUsers}
                    size="large"
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Gérer les utilisateurs
                  </ActionButton>
                  
                  <ActionButton
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleCreateUser}
                    size="large"
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Créer un utilisateur
                  </ActionButton>
                  
                  <ActionButton
                    fullWidth
                    variant="outlined"
                    startIcon={<ChatIcon />}
                    onClick={() => navigate('/chat')}
                    size="large"
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Explorer les salons
                  </ActionButton>
                  
                  <ActionButton
                    fullWidth
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportData}
                    size="large"
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Exporter les données
                  </ActionButton>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Fade>
  );
};

export default AdminDashboard;