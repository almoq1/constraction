import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Paper,
  Divider
} from '@mui/material';
import {
  Security,
  AdminPanelSettings,
  Lock,
  Email
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const SuperAdminLogin: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/super-admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store super admin token
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('isSuperAdmin', 'true');
        
        // Redirect to super admin dashboard
        navigate('/super-admin/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <Security sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom>
                Super Admin Login
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Access the Construction SaaS Platform administration
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mb: 3 }}
                endIcon={loading ? <CircularProgress size={20} /> : <AdminPanelSettings />}
              >
                {loading ? 'Logging in...' : 'Login as Super Admin'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Platform Administration
              </Typography>
            </Divider>

            {/* Information */}
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Super Admin Access:</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Create and manage construction companies
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Manage company admin users
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Monitor platform usage and statistics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Configure system settings and subscription plans
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SuperAdminLogin;