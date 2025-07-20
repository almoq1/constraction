import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircle,
  Business,
  People,
  Engineering,
  Assignment,
  Security,
  Speed,
  Support,
  Star,
  ArrowForward,
  Add,
  Domain,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const SaasLanding: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: '',
    companySlug: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    subscriptionPlan: 'FREE'
  });
  const [errors, setErrors] = useState<any>({});

  const features = [
    {
      icon: <Engineering />,
      title: 'Machine Management',
      description: 'Track and manage all your construction equipment with real-time status updates'
    },
    {
      icon: <People />,
      title: 'Driver & Staff Management',
      description: 'Manage drivers, assistants, and track working hours, salaries, and leave requests'
    },
    {
      icon: <Assignment />,
      title: 'Contract Management',
      description: 'Create and track contracts, manage client relationships, and monitor project progress'
    },
    {
      icon: <Business />,
      title: 'Rental Management',
      description: 'Manage land and room rentals, track payments, and handle tenant accounts'
    },
    {
      icon: <Security />,
      title: 'Multi-tenant Security',
      description: 'Each company has isolated data with secure, role-based access control'
    },
    {
      icon: <Speed />,
      title: 'Real-time Analytics',
      description: 'Get insights into your operations with comprehensive dashboards and reports'
    }
  ];

  const plans = [
    {
      name: 'FREE',
      price: 0,
      period: 'month',
      features: [
        '5 Users',
        '10 Machines',
        '5 Drivers',
        '10 Contracts',
        'Basic Support',
        '30-day Trial'
      ],
      popular: false
    },
    {
      name: 'BASIC',
      price: 99,
      period: 'month',
      features: [
        '10 Users',
        '25 Machines',
        '10 Drivers',
        '25 Contracts',
        'Email Support',
        'Custom Landing Page'
      ],
      popular: false
    },
    {
      name: 'PROFESSIONAL',
      price: 299,
      period: 'month',
      features: [
        '25 Users',
        '50 Machines',
        '25 Drivers',
        '50 Contracts',
        'Priority Support',
        'Advanced Analytics',
        'Custom Domain'
      ],
      popular: true
    },
    {
      name: 'ENTERPRISE',
      price: 599,
      period: 'month',
      features: [
        '100 Users',
        '200 Machines',
        '100 Drivers',
        '200 Contracts',
        '24/7 Support',
        'Dedicated Server',
        'Custom Integration'
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Ahmed Construction Co.',
      role: 'Construction Manager',
      content: 'This platform has revolutionized how we manage our construction operations. The multi-tenant feature ensures our data is secure and isolated.',
      rating: 5
    },
    {
      name: 'Kabul Builders Ltd.',
      role: 'Operations Director',
      content: 'Excellent platform for managing our equipment fleet and driver assignments. The real-time tracking has improved our efficiency significantly.',
      rating: 5
    },
    {
      name: 'Herat Engineering',
      role: 'Project Manager',
      content: 'The contract management and rental tracking features have streamlined our business processes. Highly recommended for construction companies.',
      rating: 5
    }
  ];

  const steps = [
    'Company Information',
    'Admin Account',
    'Subscription Plan',
    'Review & Create'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: any = {};

    switch (step) {
      case 0:
        if (!formData.companyName) newErrors.companyName = 'Company name is required';
        if (!formData.companySlug) newErrors.companySlug = 'Company slug is required';
        if (!formData.companyEmail) newErrors.companyEmail = 'Company email is required';
        break;
      case 1:
        if (!formData.adminName) newErrors.adminName = 'Admin name is required';
        if (!formData.adminEmail) newErrors.adminEmail = 'Admin email is required';
        if (!formData.adminPassword) newErrors.adminPassword = 'Password is required';
        if (formData.adminPassword !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/companies/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setRegisterDialogOpen(false);
        // Redirect to the new company's subdomain
        window.location.href = `https://${formData.companySlug}.${window.location.host}`;
      } else {
        setErrors({ submit: data.error });
      }
    } catch (error) {
      setErrors({ submit: 'Registration failed. Please try again.' });
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Construction SaaS Platform
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
            Multi-tenant construction management platform for modern construction companies
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => setRegisterDialogOpen(true)}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/company-select')}
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Login to Existing Company
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Powerful Features for Construction Companies
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Everything you need to manage your construction operations efficiently
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Choose Your Plan
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Start free and scale as you grow
          </Typography>
          
          <Grid container spacing={3} justifyContent="center">
            {plans.map((plan, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    position: 'relative',
                    transform: plan.popular ? 'scale(1.05)' : 'none',
                    border: plan.popular ? 2 : 1,
                    borderColor: plan.popular ? 'primary.main' : 'divider'
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1
                      }}
                    />
                  )}
                  <CardContent sx={{ pt: plan.popular ? 4 : 2 }}>
                    <Typography variant="h4" component="h3" textAlign="center" gutterBottom>
                      {plan.name}
                    </Typography>
                    <Typography variant="h3" component="div" textAlign="center" sx={{ mb: 1 }}>
                      ${plan.price}
                      <Typography component="span" variant="body2" color="text.secondary">
                        /{plan.period}
                      </Typography>
                    </Typography>
                    <List dense>
                      {plan.features.map((feature, featureIndex) => (
                        <ListItem key={featureIndex} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button
                      variant={plan.popular ? 'contained' : 'outlined'}
                      fullWidth
                      onClick={() => {
                        setFormData(prev => ({ ...prev, subscriptionPlan: plan.name }));
                        setRegisterDialogOpen(true);
                      }}
                    >
                      Get Started
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          What Our Customers Say
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} color="primary" fontSize="small" />
                  ))}
                </Box>
                <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                  "{testimonial.content}"
                </Typography>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {testimonial.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {testimonial.role}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg" textAlign="center">
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Transform Your Construction Business?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join hundreds of construction companies already using our platform
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setRegisterDialogOpen(true)}
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            Start Your Free Trial Today
          </Button>
        </Container>
      </Box>

      {/* Registration Dialog */}
      <Dialog 
        open={registerDialogOpen} 
        onClose={() => setRegisterDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="h2">
            Register Your Company
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.submit}
            </Alert>
          )}

          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  error={!!errors.companyName}
                  helperText={errors.companyName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Slug (for subdomain)"
                  value={formData.companySlug}
                  onChange={(e) => handleInputChange('companySlug', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  error={!!errors.companySlug}
                  helperText={errors.companySlug || 'This will be your subdomain (e.g., yourcompany.construction.com)'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Email"
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                  error={!!errors.companyEmail}
                  helperText={errors.companyEmail}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Phone"
                  value={formData.companyPhone}
                  onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Address"
                  multiline
                  rows={2}
                  value={formData.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Admin Name"
                  value={formData.adminName}
                  onChange={(e) => handleInputChange('adminName', e.target.value)}
                  error={!!errors.adminName}
                  helperText={errors.adminName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Admin Email"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                  error={!!errors.adminEmail}
                  helperText={errors.adminEmail}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                  error={!!errors.adminPassword}
                  helperText={errors.adminPassword}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Select Subscription Plan
              </Typography>
              <Grid container spacing={2}>
                {plans.map((plan, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: formData.subscriptionPlan === plan.name ? 2 : 1,
                        borderColor: formData.subscriptionPlan === plan.name ? 'primary.main' : 'divider'
                      }}
                      onClick={() => handleInputChange('subscriptionPlan', plan.name)}
                    >
                      <CardContent>
                        <Typography variant="h6">{plan.name}</Typography>
                        <Typography variant="h4">${plan.price}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          per {plan.period}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Review Your Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Company Name</Typography>
                  <Typography variant="body1">{formData.companyName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Subdomain</Typography>
                  <Typography variant="body1">{formData.companySlug}.construction.com</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Admin Email</Typography>
                  <Typography variant="body1">{formData.adminEmail}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Plan</Typography>
                  <Typography variant="body1">{formData.subscriptionPlan}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRegisterDialogOpen(false)}>
            Cancel
          </Button>
          {activeStep > 0 && (
            <Button onClick={handleBack}>
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button variant="contained" onClick={handleSubmit}>
              Create Company
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SaasLanding;