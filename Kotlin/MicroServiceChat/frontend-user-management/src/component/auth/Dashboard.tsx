import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  BarChart as ChartIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material'; 
import { useAuth } from '../../context/AuthContext';
import authService from '../../service/auth.service';
import statisticsService from '../../service/statistics.service';
import type { UserStatisticsResponse } from '../../type/statistics.types';
import { UserRole } from '../../type/user.types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [statistics, setStatistics] = useState<UserStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      loadStatistics();
    }
  }, [user]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const data = await statisticsService.getUserStatistics();
      setStatistics(data);
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (user) {
      await authService.logout(user.id);
      logout();
      navigate('/login');
    }
  };

  if (!user) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Welcome back, {user.firstName || user.email}!
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip 
                  label={user.role}
                  size="small"
                  sx={{ bgcolor: 'white', color: 'primary.main' }}
                />
                <Chip 
                  label={user.status}
                  size="small"
                  sx={{ bgcolor: 'white', color: 'primary.main' }}
                />
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Logout
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Action Cards */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
          <Paper 
            sx={{ 
              flex: '1 1 200px',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
            onClick={() => navigate('/profile')}
          >
            <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6">My Profile</Typography>
              <Typography variant="body2" color="textSecondary">
                View and edit your profile
              </Typography>
            </Box>
          </Paper>

          {user.role === UserRole.ADMIN && (
            <>
              <Paper 
                sx={{ 
                  flex: '1 1 200px',
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
                onClick={() => navigate('/admin/users')}
              >
                <AdminIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                <Box>
                  <Typography variant="h6">User Management</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Manage system users
                  </Typography>
                </Box>
              </Paper>

              <Paper 
                sx={{ 
                  flex: '1 1 200px',
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
                onClick={() => navigate('/statistics')}
              >
                <ChartIcon sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="h6">Statistics</Typography>
                  <Typography variant="body2" color="textSecondary">
                    View system statistics
                  </Typography>
                </Box>
              </Paper>
            </>
          )}
        </Box>

        {/* Statistics Preview for Admin */}
        {user.role === UserRole.ADMIN && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              System Overview
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : statistics && (
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Card sx={{ flex: '1 1 150px' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Users
                    </Typography>
                    <Typography variant="h4">
                      {statistics.totalUsers}
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: '1 1 150px' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Active Users
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {statistics.activeUsers}
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: '1 1 150px' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      New (7 days)
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      {statistics.newUsersLast7Days}
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: '1 1 150px' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Pending Verification
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {statistics.pendingVerification}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Paper>
        )}

        {/* Recent Activity */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={() => navigate('/profile')}>
              Edit Profile
            </Button>
            <Button variant="outlined" onClick={() => navigate('/profile?tab=1')}>
              Change Password
            </Button>
            <Button variant="outlined" onClick={() => navigate('/profile?tab=2')}>
              Preferences
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;