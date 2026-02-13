// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { authApi } from '../services/api/auth';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material';
import {
  LockOutlined as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Key as KeyIcon,
  Login as LoginIcon,
  RocketLaunch as RocketIcon,
} from '@mui/icons-material';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Login attempt with:', formData.email);
      
      const response = await authApi.login(formData.email, formData.password);
      
      console.log('Login API response:', response.data);
      
      if (response.data.success) {
        await login(formData.email, formData.password);
        toast.success('Connexion réussie !');
        
        const from = (location.state as any)?.from || '/chat';
        navigate(from, { replace: true });
        
      } else {
        const errorMsg = response.data.message || 'Échec de la connexion';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Login error details:', error);
      
      let errorMessage = 'Erreur de connexion';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.response?.status === 403) {
        errorMessage = 'Compte désactivé';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = (role: 'user' | 'admin') => {
    const credentials = {
      user: { email: 'user@example.com', password: 'password123' },
      admin: { email: 'admin@example.com', password: 'admin123' }
    };
    setFormData(credentials[role]);
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 1200, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
        {/* Left Side - Brand/Info */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 6,
            display: { xs: 'none', lg: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            minHeight: 600,
          }}
        >
          {/* Background Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, transparent 70%)`,
              animation: 'float 8s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-20px)' },
              },
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -150,
              left: -150,
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#fff', 0.05)} 0%, transparent 70%)`,
            }}
          />

          {/* Content */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
              <RocketIcon sx={{ fontSize: 60, opacity: 0.9 }} />
              <Box>
                <Typography variant="h3" fontWeight={800}>
                  ChatSphere
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Plateforme de communication moderne
                </Typography>
              </Box>
            </Box>

            <Typography variant="h2" fontWeight={700} sx={{ mb: 4, fontSize: '3rem', lineHeight: 1.2 }}>
              Connectez-vous à votre espace de travail
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'white', opacity: 0.8 }} />
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Messages en temps réel
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'white', opacity: 0.8 }} />
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Salons de discussion collaboratifs
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'white', opacity: 0.8 }} />
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Sécurité et confidentialité
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 8, pt: 4, borderTop: `1px solid ${alpha('#fff', 0.2)}` }}>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                "La meilleure plateforme pour les équipes modernes"
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Right Side - Login Form */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 500,
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: theme.palette.background.paper,
              boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.05)}`,
            }}
          >
            {/* Back Button */}
            <IconButton
              onClick={() => navigate('/')}
              sx={{
                mb: 3,
                color: theme.palette.text.secondary,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
              }}
            >
              <ArrowBackIcon />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Retour à l'accueil
              </Typography>
            </IconButton>

            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <LockIcon sx={{ color: theme.palette.primary.main, fontSize: 40 }} />
              </Box>
              <Typography variant="h3" fontWeight={800} gutterBottom>
                Connexion
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Accédez à votre compte pour continuer
              </Typography>
            </Box>

            {/* Test Credentials (Dev only) */}
            {import.meta.env.DEV && (
              <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Comptes de test :
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => fillTestCredentials('user')}
                    sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                  >
                    Utilisateur standard
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => fillTestCredentials('admin')}
                    sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                  >
                    Administrateur
                  </Button>
                </Box>
              </Box>
            )}

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 4,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                }}
              >
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={onSubmit} sx={{ width: '100%' }}>
              {/* Email Field */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  Adresse email
                </Typography>
                <TextField
                  fullWidth
                  placeholder="exemple@email.com"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value.trim() })}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ mr: 2, color: theme.palette.text.secondary }} />
                    ),
                    sx: { borderRadius: 2, height: 56 },
                  }}
                />
              </Box>

              {/* Password Field */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  Mot de passe
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Votre mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <KeyIcon sx={{ mr: 2, color: theme.palette.text.secondary }} />
                    ),
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                        sx={{ mr: 1 }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    ),
                    sx: { borderRadius: 2, height: 56 },
                  }}
                />
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !formData.email || !formData.password}
                sx={{
                  height: 56,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                  transition: 'all 0.3s ease',
                  mb: 4,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  <>
                    <LoginIcon sx={{ mr: 1 }} />
                    Se connecter
                  </>
                )}
              </Button>

              {/* Links */}
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Pas encore de compte ?
                </Typography>
                <Button
                  component={Link}
                  to="/register"
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  Créer un compte gratuit
                </Button>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 6, pt: 4, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`, textAlign: 'center' }}>
              <Typography variant="caption" color="text.disabled">
                En vous connectant, vous acceptez nos conditions d'utilisation
                <Box component="br" />
                © {new Date().getFullYear()} ChatSphere. Tous droits réservés.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;