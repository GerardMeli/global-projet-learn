// pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  alpha,
  useTheme,
} from '@mui/material';
import {
  PersonAddOutlined as PersonAddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Key as KeyIcon,
  Badge as BadgeIcon,
  RocketLaunch as RocketIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { authApi } from '../services/api/auth';
import { toast } from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'USER',
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Register attempt with:', formData);
      
      const response = await authApi.register(formData.email, formData.password, formData.role);
      
      console.log('Register response:', response.data);
      
      if (response.data.success) {
        toast.success('Compte créé avec succès !');
        
        try {
          const loginResponse = await authApi.login(formData.email, formData.password);
          
          if (loginResponse.data.success) {
            const { token, user } = loginResponse.data.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            toast.success('Connexion automatique réussie !');
            navigate('/chat');
          }
        } catch (loginError) {
          navigate('/login');
        }
        
      } else {
        setError(response.data.message || 'Échec de l\'inscription');
        toast.error(response.data.message || 'Échec de l\'inscription');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      
      let errorMessage = 'Erreur lors de l\'inscription';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 1200, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
        {/* Left Side - Registration Form */}
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
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
                }}
              >
                <PersonAddIcon sx={{ color: theme.palette.success.main, fontSize: 40 }} />
              </Box>
              <Typography variant="h3" fontWeight={800} gutterBottom>
                Créer un compte
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Rejoignez notre communauté de communication
              </Typography>
            </Box>

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

            {/* Registration Form */}
            <Box component="form" onSubmit={onSubmit} sx={{ width: '100%' }}>
              {/* Email Field */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  Adresse email
                </Typography>
                <TextField
                  fullWidth
                  placeholder="votre.email@exemple.com"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  Mot de passe
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Créez un mot de passe sécurisé"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Minimum 8 caractères avec chiffres et lettres
                </Typography>
              </Box>

              {/* Role Selection */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  Type de compte
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    sx={{
                      borderRadius: 2,
                      height: 56,
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      },
                    }}
                  >
                    <MenuItem value="USER">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <BadgeIcon sx={{ color: theme.palette.primary.main }} />
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Utilisateur
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Accès standard aux fonctionnalités
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="ADMIN">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <BadgeIcon sx={{ color: theme.palette.secondary.main }} />
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Administrateur
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Accès complet à toutes les fonctionnalités
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Benefits */}
              <Box
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
                  Avantages de l'inscription :
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircleIcon sx={{ fontSize: 20, color: theme.palette.success.main }} />
                    <Typography variant="body2" color="text.secondary">
                      Messages en temps réel
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircleIcon sx={{ fontSize: 20, color: theme.palette.success.main }} />
                    <Typography variant="body2" color="text.secondary">
                      Salons illimités
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircleIcon sx={{ fontSize: 20, color: theme.palette.success.main }} />
                    <Typography variant="body2" color="text.secondary">
                      Support prioritaire
                    </Typography>
                  </Box>
                </Box>
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
                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.3)}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 32px ${alpha(theme.palette.success.main, 0.4)}`,
                  },
                  transition: 'all 0.3s ease',
                  mb: 4,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  <>
                    <PersonAddIcon sx={{ mr: 1 }} />
                    Créer mon compte
                  </>
                )}
              </Button>

              {/* Links */}
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Déjà un compte ?
                </Typography>
                <Button
                  component={Link}
                  to="/login"
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
                  Se connecter
                </Button>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 6, pt: 4, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`, textAlign: 'center' }}>
              <Typography variant="caption" color="text.disabled">
                En créant un compte, vous acceptez nos conditions d'utilisation
                <Box component="br" />
                © {new Date().getFullYear()} ChatSphere. Vos données sont sécurisées.
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Right Side - Brand/Info */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 6,
            display: { xs: 'none', lg: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
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
                  Rejoignez notre communauté
                </Typography>
              </Box>
            </Box>

            <Typography variant="h2" fontWeight={700} sx={{ mb: 4, fontSize: '3rem', lineHeight: 1.2 }}>
              Démarrez votre voyage de communication
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'white', opacity: 0.8 }} />
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Création de compte gratuite et instantanée
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'white', opacity: 0.8 }} />
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Accès immédiat à toutes les fonctionnalités
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'white', opacity: 0.8 }} />
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Support 24/7 et assistance technique
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 8, pt: 4, borderTop: `1px solid ${alpha('#fff', 0.2)}` }}>
              <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                "Rejoignez plus de 10,000 utilisateurs satisfaits"
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Évaluation moyenne : 4.8/5 ⭐
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;