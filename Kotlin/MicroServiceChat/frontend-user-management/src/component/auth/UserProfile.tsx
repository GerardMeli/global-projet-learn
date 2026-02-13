import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tab,
  Tabs,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {  Person as PersonIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../service/profile.service';
import type { UserProfileUpdateRequest, PasswordChangeRequest, UserPreferencesUpdateRequest } from '../../type/profile.types';
import { Theme, Language } from '../../type/user.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const profileValidationSchema = yup.object({
  firstName: yup.string().max(100, 'First name too long'),
  lastName: yup.string().max(100, 'Last name too long'),
  phoneNumber: yup.string().matches(
    /^\+?[0-9\s\-()]{7,20}$/,
    'Invalid phone number format'
  ),
  address: yup.string().max(45, 'Address too long')
});

const passwordValidationSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/,
      'Password must contain at least one digit, one lowercase, one uppercase, one special character and no spaces'
    )
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password')
});

const UserProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  const profileFormik = useFormik<UserProfileUpdateRequest>({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      address: user?.address || ''
    },
    validationSchema: profileValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!user) return;
      setLoading(true);
      try {
        await profileService.updateUserProfile(user.id, values);
        await refreshUser();
        setSuccess('Profile updated successfully');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to update profile');
      } finally {
        setLoading(false);
      }
    }
  });

  const passwordFormik = useFormik<PasswordChangeRequest>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      if (!user) return;
      setLoading(true);
      try {
        await profileService.changePassword(user.id, values);
        setSuccess('Password changed successfully');
        passwordFormik.resetForm();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to change password');
      } finally {
        setLoading(false);
      }
    }
  });

  const handlePreferencesChange = async (
    field: keyof UserPreferencesUpdateRequest,
    value: any
  ) => {
    if (!user) return;
    try {
      await profileService.updateUserPreferences(user.id, { [field]: value });
      await refreshUser();
      setSuccess('Preferences updated');
    } catch (err: any) {
      setError('Failed to update preferences');
    }
  };

  const handleEmailChange = async () => {
    if (!user) return;
    try {
      await profileService.requestEmailChange(user.id, {
        newEmail,
        password: emailPassword
      });
      setEmailDialogOpen(false);
      setSuccess('Email change request sent. Please check your new email for verification.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request email change');
    }
  };

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 2fr'
          },
          gap: 3
        }}
      >
        {/* Profile Summary */}
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              margin: '0 auto 16px',
              bgcolor: 'primary.main'
            }}
          >
            <PersonIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography variant="h6">
            {user.firstName} {user.lastName}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            {user.email}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip
              label={user.role}
              color="primary"
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip
              label={user.status}
              color={user.status === 'ACTIVE' ? 'success' : 'warning'}
              size="small"
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" align="left">
            <strong>Member since:</strong>{' '}
            {new Date(user.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" align="left">
            <strong>Email verified:</strong> {user.emailVerified ? 'Yes' : 'No'}
          </Typography>
          <Typography variant="body2" align="left">
            <strong>Failed login attempts:</strong> {user.failedLoginAttempts}
          </Typography>
        </Paper>

        {/* Main Content */}
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Profile Information" />
            <Tab label="Security" />
            <Tab label="Preferences" />
          </Tabs>

          {/* Profile Information Tab */}
          <TabPanel value={tabValue} index={0}>
            <form onSubmit={profileFormik.handleSubmit}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)'
                  },
                  gap: 2
                }}
              >
                <TextField
                  fullWidth
                  name="firstName"
                  label="First Name"
                  value={profileFormik.values.firstName}
                  onChange={profileFormik.handleChange}
                  error={profileFormik.touched.firstName && Boolean(profileFormik.errors.firstName)}
                  helperText={profileFormik.touched.firstName && profileFormik.errors.firstName}
                />
                <TextField
                  fullWidth
                  name="lastName"
                  label="Last Name"
                  value={profileFormik.values.lastName}
                  onChange={profileFormik.handleChange}
                  error={profileFormik.touched.lastName && Boolean(profileFormik.errors.lastName)}
                  helperText={profileFormik.touched.lastName && profileFormik.errors.lastName}
                />
                <TextField
                  fullWidth
                  name="phoneNumber"
                  label="Phone Number"
                  value={profileFormik.values.phoneNumber}
                  onChange={profileFormik.handleChange}
                  error={profileFormik.touched.phoneNumber && Boolean(profileFormik.errors.phoneNumber)}
                  helperText={profileFormik.touched.phoneNumber && profileFormik.errors.phoneNumber}
                  sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                />
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  value={profileFormik.values.address}
                  onChange={profileFormik.handleChange}
                  error={profileFormik.touched.address && Boolean(profileFormik.errors.address)}
                  helperText={profileFormik.touched.address && profileFormik.errors.address}
                  sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                />
                <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Box>
            </form>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="h6" gutterBottom>
                Email Address
              </Typography>
              <Typography variant="body1" gutterBottom>
                Current: {user.email}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setEmailDialogOpen(true)}
                disabled={!user.emailVerified}
              >
                Change Email
              </Button>
            </Box>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={tabValue} index={1}>
            <form onSubmit={passwordFormik.handleSubmit}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2
                }}
              >
                <TextField
                  fullWidth
                  type="password"
                  name="currentPassword"
                  label="Current Password"
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                  helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                />
                <TextField
                  fullWidth
                  type="password"
                  name="newPassword"
                  label="New Password"
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                  helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                />
                <TextField
                  fullWidth
                  type="password"
                  name="confirmPassword"
                  label="Confirm New Password"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                  helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                />
                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </Box>
              </Box>
            </form>
          </TabPanel>

          {/* Preferences Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box
              sx={{
                display: 'grid',
                gap: 3
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={user.language}
                  label="Language"
                  onChange={(e) => handlePreferencesChange('language', e.target.value)}
                >
                  {Object.values(Language).map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      {lang === 'FR' && 'Français'}
                      {lang === 'EN' && 'English'}
                      {lang === 'ES' && 'Español'}
                      {lang === 'DE' && 'Deutsch'}
                      {lang === 'IT' && 'Italiano'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={user.theme}
                  label="Theme"
                  onChange={(e) => handlePreferencesChange('theme', e.target.value)}
                >
                  {Object.values(Theme).map((theme) => (
                    <MenuItem key={theme} value={theme}>
                      {theme}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={user.emailNotifications}
                    onChange={(e) => handlePreferencesChange('emailNotifications', e.target.checked)}
                  />
                }
                label="Email Notifications"
              />
            </Box>
          </TabPanel>
        </Paper>
      </Box>

      {/* Email Change Dialog */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)}>
        <DialogTitle>Change Email Address</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="New Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEmailChange} variant="contained">
            Request Change
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;