// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Paper,
  Fade,
  Zoom,
  Skeleton,
  IconButton,
  keyframes,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  PlayArrow as PlayArrowIcon,
  Forum as ForumIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  ChevronRight as ChevronRightIcon,
  Chat as ChatIcon,
  Verified as VerifiedIcon,
  TrendingUp as TrendingUpIcon,
  PeopleAlt as PeopleAltIcon,
  Bolt as BoltIcon,
  Shield as ShieldIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { chatApi } from '../services/api/chat';
import { userApi } from '../services/api/user';
import NavBar from '../components/layouts/NavBar';

interface ChatRoom {
  id: number;
  name: string;
  type: 'PRIVATE' | 'GROUP' | 'PUBLIC';
  participantCount: number;
  description?: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
}

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
`;

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [activeFeature, setActiveFeature] = useState(0);
  const [loading, setLoading] = useState(true);
  const [popularRooms, setPopularRooms] = useState<ChatRoom[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const roomsResponse = await chatApi.getAllChatRooms();
        const rooms = roomsResponse.data || [];
        
        const sortedRooms = [...rooms]
          .sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0))
          .slice(0, 4)
          .map(room => ({
            id: room.id,
            name: room.name,
            type: (room.type as 'PRIVATE' | 'GROUP' | 'PUBLIC') || 'PUBLIC',
            participantCount: room.participantCount || 0,
            description: room.description,
          }));
        
        setPopularRooms(sortedRooms);
        
        const usersResponse = await userApi.getAllUsers();
        const users = usersResponse.data?.data || usersResponse.data || [];
        
        const today = new Date().setHours(0, 0, 0, 0);
        const newUsersToday = users.filter((u: any) => 
          new Date(u.createdAt).getTime() >= today
        ).length;
        
        const activeUsers = users.filter((u: any) => u.isActive).length;
        
        setUserStats({
          totalUsers: users.length,
          activeUsers,
          newUsersToday,
        });
        
      } catch (error) {
        console.error('Error loading home page data:', error);
        toast.error('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <BoltIcon />,
      title: 'Messages en temps réel',
      description: 'Chattez instantanément avec la technologie WebSocket',
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${alpha('#667eea', 0.1)} 0%, ${alpha('#764ba2', 0.1)} 100%)`,
    },
    {
      icon: <ShieldIcon />,
      title: 'Sécurité maximale',
      description: 'Chiffrement de bout en bout et authentification JWT',
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${alpha('#4ade80', 0.1)} 0%, ${alpha('#22d3ee', 0.1)} 100%)`,
    },
    {
      icon: <GroupsIcon />,
      title: 'Salons multiples',
      description: 'Créez et gérez vos espaces de discussion personnalisés',
      color: theme.palette.secondary.main,
      gradient: `linear-gradient(135deg, ${alpha('#f472b6', 0.1)} 0%, ${alpha('#fb7185', 0.1)} 100%)`,
    },
    {
      icon: <SpeedIcon />,
      title: 'Performance optimale',
      description: 'Interface ultra-rapide et réactive',
      color: theme.palette.warning.main,
      gradient: `linear-gradient(135deg, ${alpha('#fbbf24', 0.1)} 0%, ${alpha('#f97316', 0.1)} 100%)`,
    },
  ];

  const stats = [
    { 
      label: 'Utilisateurs actifs', 
      value: loading ? '...' : `${userStats.activeUsers}+`, 
      icon: <PeopleAltIcon />,
      color: '#667eea',
      change: '+12%',
    },
    { 
      label: 'Messages envoyés', 
      value: '45,678+', 
      icon: <MessageIcon />,
      color: '#4ade80',
      change: '+24%',
    },
    { 
      label: 'Salons actifs', 
      value: loading ? '...' : popularRooms.length, 
      icon: <ForumIcon />,
      color: '#f472b6',
      change: '+8%',
    },
    { 
      label: 'Satisfaction', 
      value: '98%', 
      icon: <StarIcon />,
      color: '#fbbf24',
      change: '+2%',
    },
  ];

  const testimonials = [
    {
      name: 'Alexandre Martin',
      role: 'Développeur Full-Stack',
      text: 'La meilleure application de chat que j\'ai utilisée. Simple, rapide et sécurisée.',
      avatar: 'AM',
      rating: 5,
      company: 'TechCorp',
      color: '#667eea',
    },
    {
      name: 'Sophie Bernard',
      role: 'Community Manager',
      text: 'Parfait pour gérer mes communautés. Les salons privés sont très pratiques.',
      avatar: 'SB',
      rating: 5,
      company: 'SocialBoost',
      color: '#4ade80',
    },
    {
      name: 'Thomas Dubois',
      role: 'Entrepreneur',
      text: 'Indispensable pour notre équipe. La qualité audio/vidéo est exceptionnelle.',
      avatar: 'TD',
      rating: 5,
      company: 'StartUpX',
      color: '#f472b6',
    },
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/chat');
    } else {
      navigate('/register');
    }
  };

  const handleTryDemo = () => {
    toast.success('Mode démo activé ! Redirection vers le chat...');
    setTimeout(() => {
      navigate('/chat');
    }, 1000);
  };

  const handleJoinRoom = (roomId: number) => {
    if (isAuthenticated) {
      navigate(`/chat/${roomId}`);
    } else {
      toast.error('Veuillez vous connecter pour rejoindre un salon');
      navigate('/login');
    }
  };

  const renderRoomCard = (room: ChatRoom, index: number) => (
    <Box
      key={room.id}
      onClick={() => handleJoinRoom(room.id)}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: 4,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.05)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
          '& .room-content': {
            transform: 'translateY(0)',
          },
        },
      }}
    >
      {/* Background gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 120,
          background: room.type === 'PRIVATE'
            ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.2)} 0%, transparent 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.2)} 0%, transparent 100%)`,
          zIndex: 0,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: room.type === 'PRIVATE'
                  ? alpha(theme.palette.error.main, 0.1)
                  : alpha(theme.palette.success.main, 0.1),
                color: room.type === 'PRIVATE'
                  ? theme.palette.error.main
                  : theme.palette.success.main,
                border: `2px solid ${room.type === 'PRIVATE'
                  ? alpha(theme.palette.error.main, 0.2)
                  : alpha(theme.palette.success.main, 0.2)}`,
              }}
            >
              {room.type === 'PRIVATE' ? <LockIcon /> : <PublicIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
                {room.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {room.type === 'PRIVATE' ? 'Privé' : 'Public'}
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: room.type === 'PRIVATE' ? theme.palette.error.main : theme.palette.success.main,
                    animation: `${pulseAnimation} 2s infinite`,
                  }}
                />
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`${room.participantCount}`}
            size="small"
            icon={<GroupIcon />}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 'bold',
              borderRadius: 2,
            }}
          />
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 3,
            lineHeight: 1.6,
            height: 40,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {room.description || 'Rejoignez la conversation...'}
        </Typography>

        {/* Footer */}
        <Box
          className="room-content"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transition: 'transform 0.3s ease',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Cliquez pour rejoindre
          </Typography>
          <IconButton
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Navigation */}
      <NavBar />

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 4, md: 12 },
          pb: { xs: 8, md: 16 },
          background: `linear-gradient(135deg, ${alpha('#667eea', 0.03)} 0%, ${alpha('#764ba2', 0.03)} 100%)`,
        }}
      >
        {/* Animated background elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#667eea', 0.05)} 0%, transparent 70%)`,
            animation: `${floatAnimation} 20s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#764ba2', 0.05)} 0%, transparent 70%)`,
            animation: `${floatAnimation} 15s ease-in-out infinite reverse`,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: { xs: 8, lg: 12 },
            alignItems: 'center',
          }}>
            {/* Left Column */}
            <Box sx={{
              width: { xs: '100%', lg: '50%' },
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}>
              <Fade in timeout={800}>
                <Box>
                  {/* Badge */}
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1.5,
                      mb: 4,
                      px: 3,
                      py: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: 25,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <VerifiedIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      Plateforme vérifiée
                    </Typography>
                  </Box>

                  {/* Main title */}
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 800,
                      mb: 3,
                      fontSize: { xs: '2.75rem', md: '3.75rem', lg: '4.5rem' },
                      lineHeight: 1.1,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #764ba2 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Communication moderne pour équipes productives
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 6,
                      maxWidth: 600,
                      fontWeight: 400,
                      lineHeight: 1.7,
                      color: 'text.secondary',
                    }}
                  >
                    Une plateforme de chat en temps réel conçue pour les équipes modernes. 
                    Discutez, collaborez et créez ensemble dans un environnement sécurisé.
                  </Typography>

                  {/* CTA Buttons */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 8 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleGetStarted}
                      sx={{
                        px: 6,
                        py: 2,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #764ba2 100%)`,
                        boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.5)}`,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isAuthenticated ? 'Accéder au chat' : 'Commencer gratuitement'}
                      <ArrowForwardIcon sx={{ ml: 1 }} />
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleTryDemo}
                      sx={{
                        px: 6,
                        py: 2,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      <PlayArrowIcon sx={{ mr: 1 }} />
                      Voir la démo
                    </Button>
                  </Box>
                </Box>
              </Fade>

              {/* Stats */}
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                justifyContent: { xs: 'center', lg: 'flex-start' }
              }}>
                {stats.map((stat, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: '1 1 0',
                      minWidth: { xs: 'calc(50% - 12px)', sm: 'calc(25% - 12px)' },
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 3,
                      bgcolor: alpha(stat.color, 0.05),
                      border: `1px solid ${alpha(stat.color, 0.1)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        bgcolor: alpha(stat.color, 0.1),
                      },
                    }}
                  >
                    <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color, mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <TrendingUpIcon fontSize="small" />
                      {stat.change}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Right Column - Chat Preview */}
            <Box sx={{
              width: { xs: '100%', lg: '50%' },
              position: 'relative',
            }}>
              <Zoom in timeout={1200}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: `0 32px 96px ${alpha(theme.palette.primary.main, 0.2)}`,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    background: theme.palette.background.paper,
                    transform: 'perspective(1000px) rotateY(-10deg)',
                    transition: 'transform 0.5s ease',
                    '&:hover': {
                      transform: 'perspective(1000px) rotateY(0deg)',
                    },
                  }}
                >
                  {/* Chat Header */}
                  <Box
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'white', color: theme.palette.primary.main }}>
                      <ChatIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" color="white">
                        Live Chat Preview
                      </Typography>
                      <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
                        12 membres en ligne
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {['#4ade80', '#fbbf24', '#667eea'].map((color, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: color,
                            animation: `${pulseAnimation} ${1 + i * 0.5}s infinite`,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Chat Content */}
                  <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02), minHeight: 400 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          mb: 3,
                          display: 'flex',
                          flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
                          animation: `slideIn 0.5s ${i * 0.2}s both`,
                          '@keyframes slideIn': {
                            '0%': { opacity: 0, transform: `translateX(${i % 2 === 0 ? '-20px' : '20px'})` },
                            '100%': { opacity: 1, transform: 'translateX(0)' },
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            mx: 2,
                            bgcolor: i % 2 === 0 ? '#667eea' : '#f472b6',
                            boxShadow: theme.shadows[2],
                          }}
                        >
                          {i % 2 === 0 ? 'U' : 'M'}
                        </Avatar>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            maxWidth: '70%',
                            borderRadius: 3,
                            borderTopLeftRadius: i % 2 === 0 ? 0 : 3,
                            borderTopRightRadius: i % 2 === 0 ? 3 : 0,
                            bgcolor: i % 2 === 0 ? alpha('#667eea', 0.1) : 'background.paper',
                            border: `1px solid ${i % 2 === 0 ? alpha('#667eea', 0.2) : alpha(theme.palette.divider, 0.1)}`,
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {/* Message corner decoration */}
                          {i % 2 === 0 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: -8,
                                width: 16,
                                height: 16,
                                bgcolor: alpha('#667eea', 0.1),
                                transform: 'rotate(45deg)',
                              }}
                            />
                          )}
                          {i % 2 !== 0 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                right: -8,
                                width: 16,
                                height: 16,
                                bgcolor: 'background.paper',
                                transform: 'rotate(45deg)',
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                borderLeft: 'none',
                                borderBottom: 'none',
                              }}
                            />
                          )}

                          <Typography variant="body1" fontWeight={500}>
                            {i % 2 === 0
                              ? 'Salut ! Comment se passe le projet ?'
                              : 'Très bien ! Nous avons terminé la nouvelle fonctionnalité.'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                            {i % 2 === 0 ? 'Il y a 2 minutes' : 'Il y a 1 minute'}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}
                  </Box>

                  {/* Chat Input */}
                  <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flex: 1, height: 40, borderRadius: 20, bgcolor: alpha(theme.palette.divider, 0.1) }} />
                      <IconButton sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
                        <ArrowForwardIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Zoom>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, position: 'relative' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              Pourquoi nous choisir ?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Une plateforme complète conçue pour répondre à tous vos besoins de communication
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
            {features.map((feature, index) => (
              <Box
                key={index}
                onMouseEnter={() => setActiveFeature(index)}
                sx={{
                  flex: '1 1 0',
                  minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 12px)' },
                  p: 4,
                  borderRadius: 4,
                  background: feature.gradient,
                  border: `1px solid ${alpha(feature.color, 0.1)}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: activeFeature === index ? 'translateY(-8px)' : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 40px ${alpha(feature.color, 0.15)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${feature.color} 0%, ${alpha(feature.color, 0)} 100%)`,
                  }}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 3 }}>
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(feature.color, 0.1),
                      color: feature.color,
                      transition: 'all 0.3s ease',
                      transform: activeFeature === index ? 'scale(1.1)' : 'none',
                    }}
                  >
                    {React.cloneElement(feature.icon, { sx: { fontSize: 32 } })}
                  </Box>

                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Stats Section - Modern Design */}
      <Box sx={{ py: { xs: 8, md: 12 }, position: 'relative' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              Notre impact en chiffres
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Des données en temps réel qui prouvent notre efficacité
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {[
              {
                value: loading ? '...' : `${userStats.activeUsers}+`,
                label: 'Utilisateurs actifs',
                change: '+12%',
                color: '#667eea',
                icon: <PeopleAltIcon />,
                description: 'Connectés aujourd\'hui',
              },
              {
                value: '45,678+',
                label: 'Messages envoyés',
                change: '+24%',
                color: '#4ade80',
                icon: <MessageIcon />,
                description: 'Au cours des 24h',
              },
              {
                value: loading ? '...' : `${popularRooms.length}`,
                label: 'Salons actifs',
                change: '+8%',
                color: '#f472b6',
                icon: <ForumIcon />,
                description: 'Conversations en cours',
              },
              {
                value: '98%',
                label: 'Satisfaction',
                change: '+2%',
                color: '#fbbf24',
                icon: <StarIcon />,
                description: 'Clients satisfaits',
              },
            ].map((stat, index) => (
              <Box
                key={index}
                sx={{
                  flex: '1 1 0',
                  minWidth: { xs: '100%', sm: 'calc(50% - 16px)', lg: 'calc(25% - 16px)' },
                  p: 4,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${alpha(stat.color, 0.05)} 0%, ${alpha(stat.color, 0.02)} 100%)`,
                  border: `1px solid ${alpha(stat.color, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 16px 32px ${alpha(stat.color, 0.1)}`,
                  },
                }}
              >
                {/* Animated background circle */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: alpha(stat.color, 0.05),
                    animation: `${floatAnimation} 15s ease-in-out infinite`,
                  }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color, lineHeight: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <TrendingUpIcon fontSize="small" />
                      {stat.change}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'text.secondary' }}>
                  {stat.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Popular Rooms Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              Salons populaires
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Rejoignez les conversations les plus actives de la communauté
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {[1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  sx={{
                    flex: '1 1 0',
                    minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 12px)' },
                    p: 3,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.divider, 0.1),
                  }}
                >
                  <Skeleton variant="circular" width={56} height={56} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              ))}
            </Box>
          ) : popularRooms.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {popularRooms.map((room, index) => renderRoomCard(room, index))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', p: 8 }}>
              <ForumIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 3 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucun salon disponible
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Créez le premier salon pour commencer à discuter
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/chat')}
                sx={{ borderRadius: 3 }}
              >
                Créer un salon
              </Button>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/chat')}
              sx={{
                borderRadius: 3,
                px: 6,
                py: 1.5,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              Explorer tous les salons
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden' }}>
        {/* Background gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${alpha('#667eea', 0.05)} 0%, ${alpha('#764ba2', 0.05)} 100%)`,
            zIndex: 0,
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              textAlign: 'center',
              p: { xs: 4, md: 8 },
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #764ba2 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: alpha('#fff', 0.1),
                animation: `${floatAnimation} 20s ease-in-out infinite`,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -150,
                left: -150,
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: alpha('#fff', 0.05),
                animation: `${floatAnimation} 25s ease-in-out infinite reverse`,
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h2" fontWeight="bold" gutterBottom>
                Prêt à commencer ?
              </Typography>

              <Typography variant="h6" sx={{ mb: 6, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                Rejoignez des milliers d'équipes qui ont déjà transformé leur communication
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    bgcolor: 'white',
                    color: theme.palette.primary.main,
                    borderRadius: 3,
                    px: 6,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.95),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 40px ${alpha('#000', 0.2)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isAuthenticated ? 'Accéder au chat' : 'Créer un compte gratuit'}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleTryDemo}
                  sx={{
                    borderColor: alpha('#fff', 0.3),
                    color: 'white',
                    borderRadius: 3,
                    px: 6,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha('#fff', 0.1),
                    },
                  }}
                >
                  Essayer la démo
                </Button>
              </Box>

              <Typography variant="caption" sx={{ display: 'block', mt: 4, opacity: 0.7 }}>
                Aucune carte de crédit requise • Essai gratuit de 14 jours
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;