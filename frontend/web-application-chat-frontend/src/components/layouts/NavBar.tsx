// src/components/NavBar.tsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Badge,
  Tooltip,
  useTheme,
  alpha,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Chat as ChatIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  MoreVert as MoreVertIcon,
  ChevronLeft as ChevronLeftIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  AdminPanelSettings as AdminIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

// Interface pour les items de navigation
interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  requiredRole?: 'USER' | 'ADMIN';
  badgeCount?: number;
}

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  
  // États pour les menus
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  
  // État pour le drawer mobile
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // État pour le mode dark/light (exemple)
  const [darkMode, setDarkMode] = useState(false);

  // Items de navigation basés sur l'authentification et les rôles
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        label: 'Accueil',
        path: '/',
        icon: <HomeIcon />,
      },
      {
        label: 'Chat',
        path: '/chat',
        icon: <ChatIcon />,
        requiredRole: 'USER',
        badgeCount: 5, // Exemple : messages non lus
      },
    ];

    // Ajouter les items admin si l'utilisateur est admin
    if (user?.role === 'ADMIN') {
      baseItems.push(
        {
          label: 'Dashboard',
          path: '/admin',
          icon: <DashboardIcon />,
          requiredRole: 'ADMIN',
        },
        {
          label: 'Utilisateurs',
          path: '/users',
          icon: <PeopleIcon />,
          requiredRole: 'ADMIN',
        }
      );
    }

    // Ajouter le profil si authentifié
    if (isAuthenticated) {
      baseItems.push({
        label: 'Mon Profil',
        path: '/profile',
        icon: <PersonIcon />,
        requiredRole: 'USER',
      });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  // Notifications fictives (à remplacer par vos données)
  const notifications = [
    { id: 1, text: 'Nouveau message dans "Général"', time: '2 min', read: false },
    { id: 2, text: 'Bienvenue sur la plateforme !', time: '1 h', read: true },
    { id: 3, text: 'Votre compte a été vérifié', time: '1 j', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Gestionnaires d'événements
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMobileMenuClose();
    setMobileDrawerOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleUserMenuClose();
      toast.success('Déconnexion réussie');
      navigate('/login');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const handleCreateChatRoom = () => {
    // À implémenter : ouvrir une modal de création de salon
    toast.success('Créer un salon - Fonctionnalité à venir');
  };

  const handleSearch = () => {
    // À implémenter : ouvrir une barre de recherche
    toast.success('Recherche - Fonctionnalité à venir');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.success(`Mode ${!darkMode ? 'sombre' : 'clair'} activé`);
  };

  // Navigation pour mobile (Drawer)
  const mobileNav = (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
      PaperProps={{
        sx: {
          width: 280,
          bgcolor: theme.palette.background.default,
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" color="primary">
          Navigation
        </Typography>
        <IconButton onClick={() => setMobileDrawerOpen(false)}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      {/* Informations utilisateur */}
      {isAuthenticated && user && (
        <>
          <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                {user.email.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {user.email}
                </Typography>
                <Chip
                  label={user.role}
                  size="small"
                  color={user.role === 'ADMIN' ? 'secondary' : 'primary'}
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>
          </Box>
          <Divider />
        </>
      )}
      
      {/* Liste des items de navigation */}
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 1,
                mx: 1,
                my: 0.5,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
              {item.badgeCount && item.badgeCount > 0 && (
                <Chip
                  label={item.badgeCount}
                  size="small"
                  color="error"
                  sx={{ ml: 1 }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* Actions en bas du drawer */}
      <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        {isAuthenticated ? (
          <Button
            fullWidth
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ borderRadius: 2 }}
          >
            Se déconnecter
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => handleNavigation('/login')}
            sx={{ borderRadius: 2 }}
          >
            Se connecter
          </Button>
        )}
      </Box>
    </Drawer>
  );

  // Menu utilisateur (dropdown)
  const userMenu = (
    <Menu
      anchorEl={userMenuAnchor}
      open={Boolean(userMenuAnchor)}
      onClose={handleUserMenuClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          minWidth: 220,
          borderRadius: 2,
          boxShadow: theme.shadows[8],
        },
      }}
    >
      {/* En-tête du menu utilisateur */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {user?.email || 'Invité'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
        </Typography>
      </Box>
      
      <Divider />
      
      {/* Items du menu */}
      <MenuItem onClick={() => handleNavigation('/profile')}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        Mon profil
      </MenuItem>
      
      <MenuItem onClick={() => handleNavigation('/settings')}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        Paramètres
      </MenuItem>
      
      {user?.role === 'ADMIN' && (
        <>
          <Divider />
          <MenuItem onClick={() => handleNavigation('/admin')}>
            <ListItemIcon>
              <AdminIcon fontSize="small" />
            </ListItemIcon>
            Administration
          </MenuItem>
        </>
      )}
      
      <Divider />
      
      <MenuItem onClick={toggleDarkMode}>
        <ListItemIcon>
          {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
        </ListItemIcon>
        Mode {darkMode ? 'clair' : 'sombre'}
      </MenuItem>
      
      <Divider />
      
      <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" color="error" />
        </ListItemIcon>
        Se déconnecter
      </MenuItem>
    </Menu>
  );

  // Menu des notifications
  const notificationsMenu = (
    <Menu
      anchorEl={notificationsAnchor}
      open={Boolean(notificationsAnchor)}
      onClose={handleNotificationsClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          width: 320,
          maxHeight: 400,
          borderRadius: 2,
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          Notifications
        </Typography>
        <Chip
          label={`${unreadCount} non lues`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>
      
      <Divider />
      
      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={handleNotificationsClose}
              sx={{
                py: 1.5,
                borderLeft: notification.read ? 'none' : `3px solid ${theme.palette.primary.main}`,
                bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  <EmailIcon fontSize="small" />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">{notification.text}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.time}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <EmailIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              Aucune notification
            </Typography>
          </Box>
        )}
      </Box>
      
      {notifications.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 1 }}>
            <Button
              fullWidth
              size="small"
              onClick={() => {
                toast.success('Toutes les notifications marquées comme lues');
                handleNotificationsClose();
              }}
            >
              Tout marquer comme lu
            </Button>
          </Box>
        </>
      )}
    </Menu>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backdropFilter: 'blur(20px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 1 }}>
            {/* Logo et menu mobile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Bouton menu mobile */}
              <IconButton
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ display: { xs: 'flex', md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>

              {/* Logo */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 },
                }}
                onClick={() => handleNavigation('/')}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 40,
                    height: 40,
                  }}
                >
                  <ChatIcon />
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  ChatApp
                </Typography>
              </Box>
            </Box>

            {/* Navigation desktop */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4, gap: 1 }}>
              {navItems.map((item) => (
                <Tooltip key={item.path} title={item.label}>
                  <Button
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                    sx={{
                      borderRadius: 2,
                      px: 2,
                      color: location.pathname === item.path ? 
                        theme.palette.primary.main : 'text.primary',
                      bgcolor: location.pathname === item.path ? 
                        alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                      position: 'relative',
                    }}
                  >
                    {item.label}
                    {item.badgeCount && item.badgeCount > 0 && (
                      <Chip
                        label={item.badgeCount}
                        size="small"
                        color="error"
                        sx={{
                          ml: 1,
                          height: 20,
                          minWidth: 20,
                          fontSize: '0.75rem',
                        }}
                      />
                    )}
                  </Button>
                </Tooltip>
              ))}
            </Box>

            {/* Actions droite */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Bouton recherche (mobile) */}
              <Tooltip title="Rechercher">
                <IconButton
                  onClick={handleSearch}
                  sx={{ display: { xs: 'flex', sm: 'none' } }}
                >
                  <SearchIcon />
                </IconButton>
              </Tooltip>

              {/* Bouton création de salon */}
              {isAuthenticated && (
                <Tooltip title="Créer un salon">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateChatRoom}
                    sx={{
                      borderRadius: 2,
                      display: { xs: 'none', sm: 'flex' },
                    }}
                  >
                    Nouveau salon
                  </Button>
                </Tooltip>
              )}

              {/* Bouton notifications */}
              {isAuthenticated && (
                <Tooltip title="Notifications">
                  <IconButton onClick={handleNotificationsOpen}>
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              {/* Avatar utilisateur ou bouton connexion */}
              {isAuthenticated && user ? (
                <>
                  <Tooltip title="Mon compte">
                    <IconButton onClick={handleUserMenuOpen} sx={{ ml: 1 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: theme.palette.primary.main,
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                      >
                        {user.email.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<LoginIcon />}
                    onClick={() => handleNavigation('/login')}
                    sx={{ borderRadius: 2 }}
                  >
                    Connexion
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleNavigation('/register')}
                    sx={{ borderRadius: 2, display: { xs: 'none', sm: 'block' } }}
                  >
                    Inscription
                  </Button>
                </Box>
              )}

              {/* Bouton menu mobile (alternatif) */}
              <IconButton
                onClick={handleMobileMenuOpen}
                sx={{ display: { xs: 'flex', md: 'none' }, ml: 1 }}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Menus dropdown */}
      {userMenu}
      {notificationsMenu}
      
      {/* Drawer mobile */}
      {mobileNav}

      {/* Menu mobile (fallback) */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
        PaperProps={{
          sx: {
            width: 200,
            borderRadius: 2,
          },
        }}
      >
        {isAuthenticated ? (
          <>
            <MenuItem onClick={() => handleNavigation('/profile')}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Mon profil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Déconnexion
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={() => handleNavigation('/login')}>
              <ListItemIcon>
                <LoginIcon fontSize="small" />
              </ListItemIcon>
              Connexion
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/register')}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Inscription
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default NavBar;