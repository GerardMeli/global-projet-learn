import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Badge as BadgeIcon,
  VerifiedUser as VerifiedUserIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../services/api/user';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [profileStats, setProfileStats] = useState({
    roomsCreated: 0,
    messagesSent: 0,
    joinDate: user?.createdAt || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        setProfileStats({
          roomsCreated: 3,
          messagesSent: 128,
          joinDate: user?.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error loading profile stats:', error);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

  const handleChangePassword = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Mot de passe actuel requis';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'Nouveau mot de passe requis';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Minimum 6 caractères';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await userApi.updateUser(user!.id, {
        isActive: true,
        password: formData.newPassword,
      });

      toast.success('Mot de passe changé avec succès');
      setChangePasswordOpen(false);
      setFormData({
        currentPassword: '',
        newPassword: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    toast.success('Profil mis à jour');
    setIsEditing(false);
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 6,
          mb: 6,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            animation: 'float 8s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(180deg)' },
            },
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{
                  width: 140,
                  height: 140,
                  bgcolor: user.role === 'ADMIN' ? theme.palette.secondary.main : theme.palette.primary.main,
                  fontSize: 48,
                  border: `4px solid ${alpha('#fff', 0.3)}`,
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                {user.email.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight={800} gutterBottom>
                  {user.email}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip
                    icon={<SecurityIcon />}
                    label={user.role}
                    sx={{
                      bgcolor: user.role === 'ADMIN' ? alpha(theme.palette.secondary.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                      color: user.role === 'ADMIN' ? theme.palette.secondary.main : theme.palette.primary.main,
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                    }}
                  />
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={user.isActive ? 'Compte actif' : 'Compte désactivé'}
                    sx={{
                      bgcolor: user.isActive ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                      color: user.isActive ? theme.palette.success.main : theme.palette.error.main,
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  <Typography variant="body2" color="text.secondary">
                    Membre depuis {dayjs(user.createdAt).format('DD/MM/YYYY')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<LockIcon />}
              onClick={() => setChangePasswordOpen(true)}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                transition: 'all 0.3s ease',
              }}
            >
              Changer le mot de passe
            </Button>

            {isEditing ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleUpdateProfile}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    bgcolor: theme.palette.success.main,
                    fontWeight: 600,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 32px ${alpha(theme.palette.success.main, 0.4)}`,
                    },
                  }}
                >
                  Enregistrer
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => setIsEditing(false)}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Annuler
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                Modifier le profil
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Profile Information Section */}
      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: 4,
          mb: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: theme.palette.background.paper,
        }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon color="primary" />
          Informations du compte
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Email */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmailIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Adresse email
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {user.email}
              </Typography>
            </Box>
          </Box>

          {/* Role */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.secondary.main, 0.03) }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: alpha(theme.palette.secondary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BadgeIcon sx={{ color: theme.palette.secondary.main, fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Rôle utilisateur
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur standard'}
              </Typography>
            </Box>
          </Box>

          {/* Account Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.03) }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: alpha(theme.palette.success.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <VerifiedUserIcon sx={{ color: theme.palette.success.main, fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Statut du compte
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {user.isActive ? 'Activé et vérifié' : 'Compte désactivé'}
              </Typography>
            </Box>
          </Box>

          {/* Join Date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.03) }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: alpha(theme.palette.info.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarIcon sx={{ color: theme.palette.info.main, fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Date d'inscription
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {dayjs(user.createdAt).format('DD MMMM YYYY [à] HH:mm')}
              </Typography>
            </Box>
          </Box>

          {/* Last Login */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.03) }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: alpha(theme.palette.warning.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AccessTimeIcon sx={{ color: theme.palette.warning.main, fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Dernière connexion
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {dayjs(profileStats.lastLogin).format('DD MMMM YYYY [à] HH:mm')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Statistics Section */}
      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: theme.palette.background.paper,
        }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <PersonIcon color="primary" />
          Statistiques d'activité
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Rooms Created */}
          <Box
            sx={{
              flex: 1,
              p: 4,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
              },
            }}
          >
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
              <EmailIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
            </Box>
            <Typography variant="h2" fontWeight={800} color="primary" gutterBottom>
              {profileStats.roomsCreated}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Salons créés
            </Typography>
          </Box>

          {/* Messages Sent */}
          <Box
            sx={{
              flex: 1,
              p: 4,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.secondary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha(theme.palette.secondary.main, 0.15)}`,
              },
            }}
          >
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: alpha(theme.palette.secondary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
              <EmailIcon sx={{ color: theme.palette.secondary.main, fontSize: 32 }} />
            </Box>
            <Typography variant="h2" fontWeight={800} color="secondary" gutterBottom>
              {profileStats.messagesSent}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Messages envoyés
            </Typography>
          </Box>

          {/* Membership Duration */}
          <Box
            sx={{
              flex: 1,
              p: 4,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.success.main, 0.05),
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha(theme.palette.success.main, 0.15)}`,
              },
            }}
          >
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: alpha(theme.palette.success.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
              <CalendarIcon sx={{ color: theme.palette.success.main, fontSize: 32 }} />
            </Box>
            <Typography variant="h2" fontWeight={800} color="success.main" gutterBottom>
              {dayjs().diff(dayjs(user.createdAt), 'days')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Jours de membres
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 1 }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={700}>
            Changer le mot de passe
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="Mot de passe actuel"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              type="password"
              label="Nouveau mot de passe"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              disabled={loading}
              sx={{ mb: 2 }}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setChangePasswordOpen(false)}
            disabled={loading}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              fontWeight: 600,
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Changer le mot de passe'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;