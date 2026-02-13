// components/AuthDebug.tsx
import React, { useEffect } from 'react';
import { Paper, Typography, Box, Button, Alert } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, loading, isAdmin, refreshUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('=== AUTH DEBUG UPDATE ===');
    console.log('Path:', location.pathname);
    console.log('User in context:', user);
    console.log('Loading:', loading);
    console.log('Is Admin:', isAdmin);
    console.log('LocalStorage token:', localStorage.getItem('token')?.substring(0, 20) + '...');
    console.log('LocalStorage user:', localStorage.getItem('user'));
  }, [location.pathname, user, loading, isAdmin]);

  const handleRefresh = () => {
    refreshUser();
  };

  const handleClear = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Paper sx={{ p: 2, mt: 2, backgroundColor: '#fffde7', border: '1px solid #ffd54f' }}>
      <Typography variant="h6" gutterBottom color="warning.main">
        🔧 Debug Authentication
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Current Path:</strong> {location.pathname}
        </Typography>
        <Typography variant="body2">
          <strong>User in Context:</strong> {user ? user.email : 'None'}
        </Typography>
        <Typography variant="body2">
          <strong>User Role:</strong> {user?.role || 'None'}
        </Typography>
        <Typography variant="body2">
          <strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="body2">
          <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="body2">
          <strong>Token in localStorage:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}
        </Typography>
      </Box>
      
      {!user && localStorage.getItem('token') && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Token exists but user is null in context! This indicates a sync issue.
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" size="small" onClick={handleRefresh}>
          Refresh Auth
        </Button>
        <Button variant="outlined" size="small" onClick={handleClear} color="error">
          Clear Storage
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => console.log('LocalStorage:', {
            token: localStorage.getItem('token'),
            user: localStorage.getItem('user')
          })}
        >
          Log Storage
        </Button>
      </Box>
    </Paper>
  );
};

export default AuthDebug;