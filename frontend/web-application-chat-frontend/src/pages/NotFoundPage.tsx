import React from 'react';
import { Container, Typography, Box, Button, Paper, alpha, useTheme } from '@mui/material';
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  SearchOff as SearchOffIcon,
  SentimentDissatisfied as SentimentIcon,
  Explore as ExploreIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {/* Animated Background */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            zIndex: -1,
          }}
        />

        {/* Main Content */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 8 },
            textAlign: 'center',
            borderRadius: 6,
            width: '100%',
            maxWidth: 800,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            boxShadow: `0 25px 50px -12px ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          {/* Background Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: -150,
              right: -150,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              animation: 'float 8s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                '50%': { transform: 'translateY(-30px) rotate(180deg)' },
              },
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -100,
              left: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              animation: 'float 6s ease-in-out infinite reverse',
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
                width: 180,
                height: 180,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                border: `4px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                mb: 6,
                position: 'relative',
                animation: 'pulse 2s infinite',
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
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  animation: 'rotate 20s linear infinite',
                  '@keyframes rotate': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              >
                <SearchOffIcon
                  sx={{
                    fontSize: 80,
                    color: theme.palette.warning.main,
                    animation: 'bounce 2s infinite',
                    '@keyframes bounce': {
                      '0%, 100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-10px)' },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Error Code */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '4.5rem', md: '6rem' },
                fontWeight: 900,
                color: theme.palette.warning.main,
                mb: 3,
                lineHeight: 1,
                textShadow: `0 4px 20px ${alpha(theme.palette.warning.main, 0.3)}`,
                letterSpacing: '-0.02em',
              }}
            >
              404
            </Typography>

            {/* Title */}
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 3,
                color: theme.palette.text.primary,
                fontSize: { xs: '2rem', md: '2.75rem' },
                lineHeight: 1.2,
              }}
            >
              Page introuvable
            </Typography>

            {/* Description */}
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                mb: 6,
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              La page que vous recherchez semble avoir été déplacée, supprimée ou n'existe peut-être jamais.
              Ne vous inquiétez pas, voici quelques suggestions pour vous aider à retrouver votre chemin.
            </Typography>

            {/* Suggestions */}
            <Box
              sx={{
                bgcolor: alpha(theme.palette.warning.main, 0.04),
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                mb: 6,
                border: `2px dashed ${alpha(theme.palette.warning.main, 0.2)}`,
                textAlign: 'left',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.warning.main,
                  fontWeight: 700,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <SentimentIcon />
                Suggestions pour vous aider :
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: alpha(theme.palette.warning.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.5 }}>
                    <Typography variant="body2" fontWeight={700} color="warning.main">
                      1
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      Vérifiez l'URL
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Assurez-vous que l'adresse web est correctement orthographiée
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: alpha(theme.palette.warning.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.5 }}>
                    <Typography variant="body2" fontWeight={700} color="warning.main">
                      2
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      Retournez en arrière
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Utilisez le bouton "Retour" pour revenir à la page précédente
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: alpha(theme.palette.warning.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.5 }}>
                    <Typography variant="body2" fontWeight={700} color="warning.main">
                      3
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      Visitez la page d'accueil
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Naviguez depuis notre page principale pour trouver ce que vous cherchez
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
                justifyContent: 'center',
                alignItems: 'center',
                mt: 8,
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{
                  borderRadius: 3,
                  px: 5,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.3)}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 32px ${alpha(theme.palette.warning.main, 0.4)}`,
                  },
                  transition: 'all 0.3s ease',
                  minWidth: { xs: '100%', md: 'auto' },
                }}
              >
                Retour à la page précédente
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
                sx={{
                  borderRadius: 3,
                  px: 5,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
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
                  minWidth: { xs: '100%', md: 'auto' },
                }}
              >
                Page d'accueil
              </Button>
            </Box>

            {/* Additional Actions */}
            <Box sx={{ mt: 6, pt: 6, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '0.95rem' }}>
                Besoin d'aide supplémentaire ?
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="text"
                  startIcon={<ExploreIcon />}
                  onClick={() => navigate('/chat')}
                  sx={{
                    color: theme.palette.secondary.main,
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.secondary.main, 0.05),
                    },
                  }}
                >
                  Explorer le chat
                </Button>
                <Button
                  variant="text"
                  startIcon={<RefreshIcon />}
                  onClick={() => window.location.reload()}
                  sx={{
                    color: theme.palette.info.main,
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                    },
                  }}
                >
                  Recharger la page
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.85rem' }}>
            Si vous pensez qu'il s'agit d'une erreur ou si vous avez besoin d'assistance,
            <Box component="br" />
            veuillez contacter notre équipe de support à support@chatsphere.com
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFoundPage;