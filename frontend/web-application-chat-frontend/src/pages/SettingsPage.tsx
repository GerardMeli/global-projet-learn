import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  alpha,
  useTheme,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  VolumeUp as VolumeIcon,
  AutoAwesome as AutoAwesomeIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  RocketLaunch as RocketIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const [settings, setSettings] = React.useState({
    theme: 'light',
    language: 'fr',
    notifications: true,
    sound: true,
    autoSave: true,
    privacyMode: false,
    twoFactorAuth: false,
  });

  const handleChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Préférence mise à jour', { duration: 1500 });
  };

  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify(settings));
    toast.success('Tous les paramètres ont été sauvegardés !', { 
      icon: '💾',
      duration: 3000,
    });
  };

  const handleReset = () => {
    setSettings({
      theme: 'light',
      language: 'fr',
      notifications: true,
      sound: true,
      autoSave: true,
      privacyMode: false,
      twoFactorAuth: false,
    });
    toast.success('Paramètres réinitialisés', { duration: 2000 });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontSize: 32,
              border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <PersonIcon fontSize="inherit" />
          </Avatar>
          <Box>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Paramètres
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Personnalisez votre expérience sur la plateforme
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 600 }}
          >
            Réinitialiser
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
              transition: 'all 0.3s ease',
            }}
          >
            Sauvegarder les paramètres
          </Button>
        </Box>
      </Box>

      {/* Settings Sections */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Theme & Appearance */}
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: theme.palette.background.paper,
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: alpha(theme.palette.primary.main, 0.2),
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PaletteIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Apparence
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Personnalisez l'apparence de l'interface
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box>
              <Typography variant="body1" fontWeight={600} gutterBottom>
                Thème
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {[
                  { value: 'light', label: 'Clair', icon: '☀️' },
                  { value: 'dark', label: 'Sombre', icon: '🌙' },
                  { value: 'system', label: 'Système', icon: '🖥️' },
                ].map((themeOption) => (
                  <Box
                    key={themeOption.value}
                    onClick={() => handleChange('theme', themeOption.value)}
                    sx={{
                      flex: 1,
                      minWidth: 120,
                      p: 3,
                      borderRadius: 3,
                      cursor: 'pointer',
                      border: `2px solid ${
                        settings.theme === themeOption.value
                          ? theme.palette.primary.main
                          : alpha(theme.palette.divider, 0.2)
                      }`,
                      bgcolor: settings.theme === themeOption.value
                        ? alpha(theme.palette.primary.main, 0.05)
                        : 'transparent',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {themeOption.icon}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {themeOption.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" fontWeight={600} gutterBottom>
                Couleur d'accent
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {[
                  { color: '#2196F3', label: 'Bleu' },
                  { color: '#4CAF50', label: 'Vert' },
                  { color: '#FF9800', label: 'Orange' },
                  { color: '#9C27B0', label: 'Violet' },
                  { color: '#F44336', label: 'Rouge' },
                ].map((colorOption) => (
                  <Box
                    key={colorOption.color}
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: colorOption.color,
                      cursor: 'pointer',
                      border: `3px solid ${
                        theme.palette.primary.main === colorOption.color
                          ? alpha(colorOption.color, 0.3)
                          : 'transparent'
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: `0 8px 16px ${alpha(colorOption.color, 0.3)}`,
                      },
                    }}
                  >
                    {theme.palette.primary.main === colorOption.color && (
                      <CheckCircleIcon sx={{ color: 'white', fontSize: 24 }} />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Language & Region */}
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: theme.palette.background.paper,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LanguageIcon sx={{ color: theme.palette.secondary.main, fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Langue et région
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Définissez votre langue préférée
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Langue</InputLabel>
              <Select
                value={settings.language}
                label="Langue"
                onChange={(e) => handleChange('language', e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="fr">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ fontSize: '1.5rem' }}>🇫🇷</Box>
                    <Box>
                      <Typography>Français</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Français (France)
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="en">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ fontSize: '1.5rem' }}>🇺🇸</Box>
                    <Box>
                      <Typography>English</Typography>
                      <Typography variant="caption" color="text.secondary">
                        English (US)
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="es">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ fontSize: '1.5rem' }}>🇪🇸</Box>
                    <Box>
                      <Typography>Español</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Español (España)
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="body1" fontWeight={600} gutterBottom>
                Format de date et heure
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  JJ/MM/AAAA
                </Button>
                <Button
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  AAAA-MM-JJ
                </Button>
                <Button
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  MM/JJ/AAAA
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Notifications */}
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: theme.palette.background.paper,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <NotificationsIcon sx={{ color: theme.palette.warning.main, fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gérez vos préférences de notification
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.03) }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: alpha(theme.palette.warning.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <NotificationsIcon sx={{ color: theme.palette.warning.main }} />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Notifications push
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Recevez des notifications en temps réel
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={settings.notifications}
                onChange={(e) => handleChange('notifications', e.target.checked)}
                color="warning"
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.03) }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: alpha(theme.palette.warning.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <VolumeIcon sx={{ color: theme.palette.warning.main }} />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Sons de notification
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Activez les sons pour les nouvelles notifications
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={settings.sound}
                onChange={(e) => handleChange('sound', e.target.checked)}
                color="warning"
              />
            </Box>

            <TextField
              fullWidth
              label="Son de notification personnalisé"
              placeholder="Choisissez un son..."
              sx={{ mt: 2 }}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          </Box>
        </Paper>

        {/* Privacy & Security */}
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: theme.palette.background.paper,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.error.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SecurityIcon sx={{ color: theme.palette.error.main, fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Confidentialité et sécurité
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Protégez votre compte et vos données
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.03) }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: alpha(theme.palette.error.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SecurityIcon sx={{ color: theme.palette.error.main }} />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Mode privé
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Masquez votre activité en ligne
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={settings.privacyMode}
                onChange={(e) => handleChange('privacyMode', e.target.checked)}
                color="error"
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.03) }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: alpha(theme.palette.error.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RocketIcon sx={{ color: theme.palette.error.main }} />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Authentification à deux facteurs
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajoutez une couche de sécurité supplémentaire
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={settings.twoFactorAuth}
                onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                color="error"
              />
            </Box>
          </Box>
        </Paper>

        {/* Other Settings */}
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: theme.palette.background.paper,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.info.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesomeIcon sx={{ color: theme.palette.info.main, fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Autres paramètres
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Personnalisez votre expérience
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.03) }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: alpha(theme.palette.info.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AutoAwesomeIcon sx={{ color: theme.palette.info.main }} />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Sauvegarde automatique
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sauvegarde automatique de vos modifications
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={settings.autoSave}
                onChange={(e) => handleChange('autoSave', e.target.checked)}
                color="info"
              />
            </Box>

            <TextField
              fullWidth
              label="Message d'accueil personnalisé"
              placeholder="Entrez votre message d'accueil..."
              multiline
              rows={3}
              sx={{ mt: 2 }}
              InputProps={{ sx: { borderRadius: 2 } }}
              helperText="Ce message s'affichera lorsque vous vous connecterez"
            />
          </Box>
        </Paper>
      </Box>

      {/* Bottom Alert */}
      <Box sx={{ mt: 6 }}>
        <Alert
          severity="info"
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            bgcolor: alpha(theme.palette.info.main, 0.05),
          }}
        >
          <Typography variant="body2">
            Certains paramètres nécessitent un rechargement de la page pour être appliqués.
            N'oubliez pas de sauvegarder vos modifications.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default SettingsPage;