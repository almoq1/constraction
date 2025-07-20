import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import {
  Business,
  Domain,
  Email,
  Lock,
  ArrowForward,
  Add,
  Search
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const CompanySelect: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock companies - in real app, this would come from API
  const companies = [
    {
      id: '1',
      name: 'Ahmed Construction Co.',
      slug: 'ahmed-construction',
      subdomain: 'ahmed-construction',
      logo: null,
      description: 'Professional construction services in Kabul'
    },
    {
      id: '2',
      name: 'Kabul Builders Ltd.',
      slug: 'kabul-builders',
      subdomain: 'kabul-builders',
      logo: null,
      description: 'Leading construction company in Afghanistan'
    },
    {
      id: '3',
      name: 'Herat Engineering',
      slug: 'herat-engineering',
      subdomain: 'herat-engineering',
      logo: null,
      description: 'Engineering and construction services'
    }
  ];

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompanySelect = (companySlug: string) => {
    setSelectedCompany(companySlug);
    setError('');
  };

  const handleLogin = async () => {
    if (!selectedCompany || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/companies/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain: selectedCompany,
          email,
          password
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and redirect to company dashboard
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('company', JSON.stringify(data.data.company));
        
        // Redirect to the company's subdomain
        window.location.href = `https://${selectedCompany}.${window.location.host}`;
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterNew = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="md">
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <Business />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom>
                Select Your Company
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Choose the company you want to log into, or register a new one
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Company Selection */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Available Companies
              </Typography>
              
              <TextField
                fullWidth
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2}>
                {filteredCompanies.map((company) => (
                  <Grid item xs={12} sm={6} md={4} key={company.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: selectedCompany === company.slug ? 2 : 1,
                        borderColor: selectedCompany === company.slug ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 2
                        }
                      }}
                      onClick={() => handleCompanySelect(company.slug)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: 'primary.main',
                            mx: 'auto',
                            mb: 1
                          }}
                        >
                          <Business />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {company.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {company.description}
                        </Typography>
                        <Chip
                          label={company.subdomain}
                          size="small"
                          variant="outlined"
                          icon={<Domain />}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {filteredCompanies.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No companies found matching your search.
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Login Form */}
            {selectedCompany && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Login to {companies.find(c => c.slug === selectedCompany)?.name}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{
                        startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                </Grid>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleLogin}
                  disabled={loading}
                  sx={{ mt: 2 }}
                  endIcon={loading ? <CircularProgress size={20} /> : <ArrowForward />}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Register New Company */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Don't see your company?
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleRegisterNew}
              >
                Register New Company
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default CompanySelect;