// src/pages/LogoutPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Login as LoginIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Timer as TimerIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const LogoutPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { logout, user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const performLogout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Début du processus de déconnexion');
      
      await logout();
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      setLogoutSuccess(true);
      
      if (import.meta.env.DEV) {
        console.log('✅ Déconnexion réussie pour :', user?.email);
      }
      
      toast.success('Déconnexion réussie. À bientôt !');
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleRedirectToLogin();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la déconnexion :', error);
      
      let errorMessage = 'Erreur lors de la déconnexion';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToLogin = () => {
    navigate('/login', { replace: true });
  };

  const handleRedirectToHome = () => {
    navigate('/', { replace: true });
  };

  const handleRetry = () => {
    performLogout();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performLogout();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 8,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        }}
      >
        {/* Main Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 8 },
            textAlign: 'center',
            borderRadius: 6,
            width: '100%',
            maxWidth: 600,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          {/* Background Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              animation: 'float 6s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-20px)' },
              },
            }}
          />

          {/* Content */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {/* Icon */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 140,
                height: 140,
                borderRadius: '50%',
                bgcolor: loading 
                  ? alpha(theme.palette.warning.main, 0.1)
                  : logoutSuccess 
                    ? alpha(theme.palette.success.main, 0.1)
                    : alpha(theme.palette.error.main, 0.1),
                border: `4px solid ${
                  loading 
                    ? alpha(theme.palette.warning.main, 0.2)
                    : logoutSuccess 
                      ? alpha(theme.palette.success.main, 0.2)
                      : alpha(theme.palette.error.main, 0.2)
                }`,
                mb: 6,
                position: 'relative',
                animation: loading ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.warning.main, 0.4)}` },
                  '70%': { boxShadow: `0 0 0 30px ${alpha(theme.palette.warning.main, 0)}` },
                  '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.warning.main, 0)}` },
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  bgcolor: loading 
                    ? alpha(theme.palette.warning.main, 0.05)
                    : logoutSuccess 
                      ? alpha(theme.palette.success.main, 0.05)
                      : alpha(theme.palette.error.main, 0.05),
                }}
              >
                {loading ? (
                  <CircularProgress 
                    size={60} 
                    color="warning"
                    thickness={4}
                  />
                ) : logoutSuccess ? (
                  <CheckCircleIcon
                    sx={{
                      fontSize: 70,
                      color: theme.palette.success.main,
                      animation: 'scale 1s ease-in-out',
                      '@keyframes scale': {
                        '0%': { transform: 'scale(0)' },
                        '50%': { transform: 'scale(1.2)' },
                        '100%': { transform: 'scale(1)' },
                      },
                    }}
                  />
                ) : (
                  <ErrorIcon
                    sx={{
                      fontSize: 70,
                      color: theme.palette.error.main,
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Title */}
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 3,
                color: loading 
                  ? theme.palette.warning.main
                  : logoutSuccess 
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                fontSize: { xs: '2.5rem', md: '3rem' },
              }}
            >
              {loading ? 'Déconnexion en cours...' : 
               logoutSuccess ? 'Déconnecté !' : 'Erreur'}
            </Typography>

            {/* Message */}
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                mb: 6,
                maxWidth: 500,
                mx: 'auto',
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              {loading ? (
                'Nous sécurisons votre session et nettoyons vos données en toute sécurité...'
              ) : logoutSuccess ? (
                <>
                  Vous avez été déconnecté avec succès de tous les appareils.
                  {user?.email && (
                    <Box sx={{ mt: 3, p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.05), border: `1px solid ${alpha(theme.palette.success.main, 0.1)}` }}>
                      <Typography variant="body1" fontWeight={600} color="success.main">
                        <VerifiedUserIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Compte : {user.email}
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                'Une erreur est survenue lors du processus de déconnexion.'
              )}
            </Typography>

            {/* Countdown */}
            {logoutSuccess && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  mb: 6,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <TimerIcon sx={{ color: theme.palette.info.main }} />
                <Typography variant="h6" fontWeight={600} color="info.main">
                  Redirection dans {countdown} seconde{countdown > 1 ? 's' : ''}
                </Typography>
              </Box>
            )}

            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                icon={<ErrorIcon />}
                sx={{
                  mb: 6,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                  textAlign: 'left',
                }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={handleRetry}
                    startIcon={<RefreshIcon />}
                    sx={{ fontWeight: 600 }}
                  >
                    Réessayer
                  </Button>
                }
              >
                <Typography variant="body1" fontWeight={600}>
                  {error}
                </Typography>
              </Alert>
            )}

            <Divider sx={{ my: 6 }} />

            {/* Security Information */}
            <Box
              sx={{
                bgcolor: alpha(theme.palette.grey[200], 0.5),
                p: 5,
                borderRadius: 3,
                mb: 6,
                textAlign: 'left',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 4,
                  color: theme.palette.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <SecurityIcon />
                Sécurité de votre session
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha(theme.palette.success.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 14, color: theme.palette.success.main }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      Token JWT supprimé
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Votre jeton d'authentification a été révoqué avec succès
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha(theme.palette.success.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 14, color: theme.palette.success.main }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      Données locales nettoyées
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toutes les données de session ont été supprimées de votre navigateur
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha(theme.palette.success.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 14, color: theme.palette.success.main }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      Session invalide côté serveur
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Votre session a été fermée sur tous les serveurs
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha(theme.palette.success.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 14, color: theme.palette.success.main }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      Cookies de session expirés
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tous les cookies de session ont été invalidés
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Actions */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3,
                justifyContent: 'center',
              }}
            >
              {/* Home Button */}
              <Button
                variant="outlined"
                size="large"
                startIcon={<HomeIcon />}
                onClick={handleRedirectToHome}
                sx={{
                  borderRadius: 3,
                  px: 5,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderWidth: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                  transition: 'all 0.3s ease',
                }}
                disabled={loading}
              >
                Page d'accueil
              </Button>

              {/* Login Button */}
              {(!loading || error) && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LoginIcon />}
                  onClick={handleRedirectToLogin}
                  sx={{
                    borderRadius: 3,
                    px: 5,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${logoutSuccess ? theme.palette.success.main : theme.palette.primary.main} 0%, ${logoutSuccess ? theme.palette.success.dark : theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 32px ${alpha(logoutSuccess ? theme.palette.success.main : theme.palette.primary.main, 0.4)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Se reconnecter
                </Button>
              )}
            </Box>

            {/* Cancel Link */}
            {loading && !error && (
              <Box sx={{ mt: 6 }}>
                <Button
                  variant="text"
                  onClick={handleRedirectToHome}
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: theme.palette.text.primary,
                    },
                  }}
                >
                  Annuler la déconnexion et retourner à l'accueil
                </Button>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Debug Information */}
        {import.meta.env.DEV && (
          <Paper
            elevation={0}
            sx={{
              mt: 6,
              p: 4,
              width: '100%',
              maxWidth: 600,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: theme.palette.info.main,
                fontWeight: 700,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              🐛 Informations de débogage
            </Typography>
            
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.info.main, minWidth: 120 }}>
                    Heure :
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date().toLocaleTimeString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.info.main, minWidth: 120 }}>
                    Session ID :
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {sessionStorage.getItem('sessionId') || 'N/A'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.info.main, minWidth: 120 }}>
                    Token présent :
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {localStorage.getItem('token') ? 'Oui' : 'Non'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.info.main, minWidth: 120 }}>
                    User :
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email || 'N/A'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.info.main, minWidth: 120 }}>
                    État :
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {loading ? 'Chargement' : logoutSuccess ? 'Succès' : 'Erreur'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Footer */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.85rem' }}>
            Votre sécurité et votre confidentialité sont notre priorité
            <Box component="br" />
            © {new Date().getFullYear()} ChatSphere • Application de chat sécurisée
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LogoutPage;