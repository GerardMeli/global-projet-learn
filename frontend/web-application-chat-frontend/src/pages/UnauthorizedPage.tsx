// src/pages/UnauthorizedPage.tsx
import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Lock as LockIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

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
            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.03)} 0%, ${alpha(theme.palette.error.dark, 0.02)} 100%)`,
            border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            boxShadow: `0 20px 60px ${alpha(theme.palette.error.main, 0.1)}`,
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
              background: `radial-gradient(${alpha(theme.palette.error.main, 0.05)} 0%, transparent 70%)`,
              zIndex: 0,
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
                bgcolor: alpha(theme.palette.error.main, 0.08),
                border: `4px solid ${alpha(theme.palette.error.main, 0.2)}`,
                mb: 4,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.4)}` },
                  '70%': { boxShadow: `0 0 0 20px ${alpha(theme.palette.error.main, 0)}` },
                  '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}` },
                },
              }}
            >
              <SecurityIcon
                sx={{
                  fontSize: 70,
                  color: theme.palette.error.main,
                }}
              />
            </Box>

            {/* Error Code */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '4rem', md: '6rem' },
                fontWeight: 800,
                color: theme.palette.error.main,
                mb: 2,
                lineHeight: 1,
                textShadow: `0 4px 20px ${alpha(theme.palette.error.main, 0.3)}`,
              }}
            >
              403
            </Typography>

            {/* Title */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: theme.palette.text.primary,
                fontSize: { xs: '1.75rem', md: '2.25rem' },
              }}
            >
              Accès Restreint
            </Typography>

            {/* Description */}
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                mb: 5,
                maxWidth: 500,
                mx: 'auto',
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
            </Typography>

            {/* Requirements Box */}
            <Box
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.04),
                p: 4,
                borderRadius: 3,
                mb: 5,
                borderLeft: `4px solid ${theme.palette.error.main}`,
                textAlign: 'left',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <WarningIcon sx={{ color: theme.palette.error.main }} />
                <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                  Prérequis d'accès :
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha(theme.palette.error.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <LockIcon sx={{ fontSize: 14, color: theme.palette.error.main }} />
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    Un compte utilisateur valide et authentifié
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha(theme.palette.error.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <SecurityIcon sx={{ fontSize: 14, color: theme.palette.error.main }} />
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    Les permissions de rôle appropriées (Administrateur, etc.)
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha(theme.palette.error.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <HomeIcon sx={{ fontSize: 14, color: theme.palette.error.main }} />
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    Un compte actif et vérifié par l'administration
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3,
                justifyContent: 'center',
                mt: 6,
              }}
            >
              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={handleGoBack}
                sx={{
                  borderRadius: 3,
                  px: 5,
                  py: 1.5,
                  borderWidth: 2,
                  borderColor: alpha(theme.palette.error.main, 0.3),
                  color: theme.palette.error.main,
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: theme.palette.error.main,
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.2)}`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Page précédente
              </Button>

              <Button
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                onClick={handleGoHome}
                sx={{
                  borderRadius: 3,
                  px: 5,
                  py: 1.5,
                  bgcolor: theme.palette.error.main,
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 32px ${alpha(theme.palette.error.main, 0.4)}`,
                    background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Retour à l'accueil
              </Button>
            </Box>

            {/* Login Option */}
            <Box sx={{ mt: 8, pt: 5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '0.95rem' }}>
                Si vous pensez que c'est une erreur ou si vous possédez un autre compte :
              </Typography>
              <Button
                variant="text"
                onClick={handleGoToLogin}
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'none',
                    bgcolor: 'transparent',
                    color: theme.palette.primary.dark,
                  },
                }}
              >
                Se connecter avec un compte différent
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Technical Info (Dev only) */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <SecurityIcon sx={{ color: theme.palette.info.main }} />
              <Typography
                variant="subtitle1"
                sx={{
                  color: theme.palette.info.main,
                  fontWeight: 700,
                }}
              >
                Informations de débogage (DEV uniquement)
              </Typography>
            </Box>
            
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.info.main, minWidth: 120 }}>
                    • URL actuelle :
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {window.location.pathname}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.info.main, minWidth: 120 }}>
                    • User Agent :
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {navigator.userAgent.substring(0, 50)}...
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.info.main, minWidth: 120 }}>
                    • Timestamp :
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date().toISOString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Footer */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.85rem' }}>
            Code d'erreur : 403 Forbidden • Accès non autorisé
            <Box component="br" />
            Si le problème persiste, veuillez contacter l'administrateur système.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;