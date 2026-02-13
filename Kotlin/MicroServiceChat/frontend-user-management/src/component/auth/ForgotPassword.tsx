import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup'; 
import authService from '../../service/auth.service';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required')
});

const ForgotPassword: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await authService.forgotPassword({ email: values.email });
        setEmail(values.email);
        setSuccess(true);
        setActiveStep(1);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to send reset email');
      }
    }
  });

  const steps = ['Enter your email', 'Check your inbox'];

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Reset Password
          </Typography>

          <Stepper activeStep={activeStep} sx={{ my: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>

              <form onSubmit={formik.handleSubmit}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  margin="normal"
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}

          {activeStep === 1 && (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Reset link sent successfully!
              </Alert>
              <Typography variant="body1" paragraph>
                We've sent a password reset link to:
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                {email}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Please check your email and follow the instructions to reset your password.
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Didn't receive the email? Check your spam folder or{' '}
                <Link 
                  to="#" 
                  onClick={() => {
                    setActiveStep(0);
                    setError(null);
                  }}
                  style={{ textDecoration: 'none' }}
                >
                  try again
                </Link>
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                Back to Sign In
              </Typography>
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;