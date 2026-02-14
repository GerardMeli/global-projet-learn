import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button, Paper, createTheme, CssBaseline, ThemeProvider } from '@mui/material'; 
import ForgotPassword from './component/auth/ForgotPassword';
import Register from './component/auth/Register';
import ResetPassword from './component/auth/ResetPassword';
import StatisticsDashboard from './component/auth/StatisticsDashboard';
import UserManagement from './component/auth/UserManagement';
import UserProfile from './component/auth/UserProfile';
import VerifyEmail from './component/auth/VerifyEmail';
import Layout from './component/common/Layout';
import PrivateRoute from './component/common/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import Login from './component/auth/Login';
import Dashboard from './component/auth/Dashboard';
import { ToastContainer } from 'react-toastify/unstyled';

// Composant Error Boundary
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔥 Error Boundary caught an error:', error);
    console.error('📍 Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
          <Paper sx={{ p: 4, maxWidth: 600 }}>
            <Typography variant="h4" color="error" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" paragraph>
              {this.state.error?.message || 'An unknown error occurred'}
            </Typography>
            <Typography variant="body2" component="pre" sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, overflow: 'auto' }}>
              {this.state.error?.stack}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});


// Votre App existante avec ErrorBoundary
function App() {
  console.log('🔄 App component rendering');
  
  return (
    <ErrorBoundary>
      
       <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/" element={
              // <PrivateRoute>
              //   <Layout>
                  <Dashboard />
                /* </Layout>
              </PrivateRoute> */
            } />
            
            <Route path="/dashboard" element={
              // <PrivateRoute>
                // <Layout>
                  <Dashboard />
                // </Layout>
              // </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Layout>
                  <UserProfile />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/users" element={
              <PrivateRoute adminOnly>
                <Layout>
                  <UserManagement />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/statistics" element={
              <PrivateRoute adminOnly>
                <Layout>
                  <StatisticsDashboard />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* Catch all - redirect to dashboard or login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
      
      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ThemeProvider>

    </ErrorBoundary>
  );
} export default App