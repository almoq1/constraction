import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Paper,
  Chip,
  Avatar,
  Stack,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Construction as ConstructionIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Check as CheckIcon,
  Star as StarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [contactForm, setContactForm] = React.useState({
    name: '',
    email: '',
    company: '',
    message: '',
    language: 'en'
  });
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    setContactForm(prev => ({ ...prev, language }));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the contact form data to your backend
    setSnackbar({
      open: true,
      message: t('contact.successMessage'),
      severity: 'success'
    });
    setContactForm({
      name: '',
      email: '',
      company: '',
      message: '',
      language: contactForm.language
    });
  };

  const features = [
    {
      icon: <ConstructionIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('landing.features.machines.title'),
      description: t('landing.features.machines.description')
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('landing.features.personnel.title'),
      description: t('landing.features.personnel.description')
    },
    {
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('landing.features.contracts.title'),
      description: t('landing.features.contracts.description')
    },
    {
      icon: <PaymentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('landing.features.payments.title'),
      description: t('landing.features.payments.description')
    },
    {
      icon: <ScheduleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('landing.features.scheduling.title'),
      description: t('landing.features.scheduling.description')
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('landing.features.security.title'),
      description: t('landing.features.security.description')
    }
  ];

  const pricingPlans = [
    {
      title: t('landing.pricing.basic.title'),
      price: t('landing.pricing.basic.price'),
      features: [
        t('landing.pricing.basic.feature1'),
        t('landing.pricing.basic.feature2'),
        t('landing.pricing.basic.feature3'),
        t('landing.pricing.basic.feature4')
      ],
      popular: false
    },
    {
      title: t('landing.pricing.professional.title'),
      price: t('landing.pricing.professional.price'),
      features: [
        t('landing.pricing.professional.feature1'),
        t('landing.pricing.professional.feature2'),
        t('landing.pricing.professional.feature3'),
        t('landing.pricing.professional.feature4'),
        t('landing.pricing.professional.feature5')
      ],
      popular: true
    },
    {
      title: t('landing.pricing.enterprise.title'),
      price: t('landing.pricing.enterprise.price'),
      features: [
        t('landing.pricing.enterprise.feature1'),
        t('landing.pricing.enterprise.feature2'),
        t('landing.pricing.enterprise.feature3'),
        t('landing.pricing.enterprise.feature4'),
        t('landing.pricing.enterprise.feature5'),
        t('landing.pricing.enterprise.feature6')
      ],
      popular: false
    }
  ];

  const drawer = (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6" color="primary">
          Construction SaaS
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        <ListItem button>
          <ListItemText primary={t('nav.home')} />
        </ListItem>
        <ListItem button>
          <ListItemText primary={t('nav.features')} />
        </ListItem>
        <ListItem button>
          <ListItemText primary={t('nav.pricing')} />
        </ListItem>
        <ListItem button>
          <ListItemText primary={t('nav.contact')} />
        </ListItem>
        <ListItem button>
          <ListItemText primary={t('nav.login')} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation */}
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}>
            Construction SaaS
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button color="inherit">{t('nav.home')}</Button>
              <Button color="inherit">{t('nav.features')}</Button>
              <Button color="inherit">{t('nav.pricing')}</Button>
              <Button color="inherit">{t('nav.contact')}</Button>
              <Button variant="outlined" color="primary">{t('nav.login')}</Button>
              <Button variant="contained" color="primary">{t('nav.signup')}</Button>
            </Box>
          )}
          
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 }
        }}
      >
        {drawer}
      </Drawer>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          pt: 12,
          pb: 8
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {t('landing.hero.title')}
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4, opacity: 0.9 }}>
                {t('landing.hero.subtitle')}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'grey.100'
                    }
                  }}
                >
                  {t('landing.hero.getStarted')}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  {t('landing.hero.learnMore')}
                </Button>
              </Stack>
              
              {/* Language Selector */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LanguageIcon />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={i18n.language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    sx={{ backgroundColor: 'white', color: 'primary.main' }}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="dr">دری</MenuItem>
                    <MenuItem value="ps">پښتو</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/hero-image.jpg"
                alt="Construction Management"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 3
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            {t('landing.features.title')}
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            {t('landing.features.subtitle')}
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
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
      </Box>

      {/* Pricing Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            {t('landing.pricing.title')}
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            {t('landing.pricing.subtitle')}
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
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
                      label={t('landing.pricing.popular')}
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
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" component="h3" gutterBottom>
                      {plan.title}
                    </Typography>
                    <Typography variant="h3" component="div" color="primary" gutterBottom>
                      {plan.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {t('landing.pricing.perMonth')}
                    </Typography>
                    
                    <Box sx={{ my: 3 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <Box key={featureIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant={plan.popular ? 'contained' : 'outlined'}
                      fullWidth
                      size="large"
                    >
                      {t('landing.pricing.choosePlan')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" gutterBottom>
                {t('landing.contact.title')}
              </Typography>
              <Typography variant="h6" color="text.secondary" paragraph>
                {t('landing.contact.subtitle')}
              </Typography>
              
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmailIcon color="primary" />
                  <Typography>info@constructionsaas.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PhoneIcon color="primary" />
                  <Typography>+1 (555) 123-4567</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationIcon color="primary" />
                  <Typography>{t('landing.contact.address')}</Typography>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                  {t('landing.contact.formTitle')}
                </Typography>
                <Box component="form" onSubmit={handleContactSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('landing.contact.name')}
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('landing.contact.email')}
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={t('landing.contact.company')}
                        value={contactForm.company}
                        onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={t('landing.contact.message')}
                        multiline
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                      >
                        {t('landing.contact.send')}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Construction SaaS
              </Typography>
              <Typography variant="body2" color="grey.400">
                {t('landing.footer.description')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom>
                {t('landing.footer.product')}
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ display: 'block', mb: 1 }}>
                {t('landing.footer.features')}
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ display: 'block', mb: 1 }}>
                {t('landing.footer.pricing')}
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ display: 'block', mb: 1 }}>
                {t('landing.footer.documentation')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom>
                {t('landing.footer.company')}
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ display: 'block', mb: 1 }}>
                {t('landing.footer.about')}
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ display: 'block', mb: 1 }}>
                {t('landing.footer.contact')}
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ display: 'block', mb: 1 }}>
                {t('landing.footer.careers')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom>
                {t('landing.footer.support')}
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ display: 'block', mb: 1 }}>
                {t('landing.footer.help')}
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ display: 'block', mb: 1 }}>
                {t('landing.footer.status')}
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ display: 'block', mb: 1 }}>
                {t('landing.footer.api')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom>
                {t('landing.footer.legal')}
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ display: 'block', mb: 1 }}>
                {t('landing.footer.privacy')}
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ display: 'block', mb: 1 }}>
                {t('landing.footer.terms')}
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ display: 'block', mb: 1 }}>
                {t('landing.footer.cookies')}
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4, borderColor: 'grey.800' }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="grey.400">
              © 2024 Construction SaaS. {t('landing.footer.rights')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" size="small">
                {t('landing.footer.privacy')}
              </Button>
              <Button color="inherit" size="small">
                {t('landing.footer.terms')}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LandingPage;