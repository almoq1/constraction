import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Engineering,
  Business,
  People,
  Assignment,
  Star,
  Phone,
  Email,
  LocationOn,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface LandingPageData {
  id: string;
  title: string;
  subtitle?: string;
  heroImage?: string;
  heroVideo?: string;
  aboutTitle: string;
  aboutContent?: string;
  aboutImage?: string;
  services?: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  testimonials?: Array<{
    name: string;
    role: string;
    content: string;
    rating: number;
  }>;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  footerText?: string;
  customCSS?: string;
  customJS?: string;
  isPublished: boolean;
}

const CompanyLanding: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [landingData, setLandingData] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLandingPage();
  }, []);

  const fetchLandingPage = async () => {
    try {
      const response = await fetch('/api/companies/landing-page');
      const data = await response.json();

      if (data.success) {
        setLandingData(data.data);
      } else {
        setError('Failed to load landing page');
      }
    } catch (err) {
      setError('Failed to load landing page');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'engineering':
        return <Engineering />;
      case 'business':
        return <Business />;
      case 'people':
        return <People />;
      case 'assignment':
        return <Assignment />;
      default:
        return <Engineering />;
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook />;
      case 'twitter':
        return <Twitter />;
      case 'linkedin':
        return <LinkedIn />;
      case 'instagram':
        return <Instagram />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !landingData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Landing page not found'}</Alert>
      </Container>
    );
  }

  if (!landingData.isPublished) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          This landing page is not published yet. Please contact the administrator.
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Custom CSS */}
      {landingData.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: landingData.customCSS }} />
      )}

      {/* Hero Section */}
      <Box
        sx={{
          background: landingData.heroImage 
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${landingData.heroImage})`
            : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: 12,
          textAlign: 'center',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {landingData.title}
          </Typography>
          {landingData.subtitle && (
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
              {landingData.subtitle}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              href="#contact"
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="#about"
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      {/* About Section */}
      <Box id="about" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" gutterBottom>
                {landingData.aboutTitle}
              </Typography>
              {landingData.aboutContent && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {landingData.aboutContent}
                </Typography>
              )}
              <Button variant="contained" size="large">
                Learn More
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              {landingData.aboutImage ? (
                <Box
                  component="img"
                  src={landingData.aboutImage}
                  alt="About Us"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    boxShadow: 3
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 300,
                    bgcolor: 'grey.200',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    About Image
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      {landingData.services && landingData.services.length > 0 && (
        <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
              Our Services
            </Typography>
            <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
              Professional construction and equipment services
            </Typography>
            
            <Grid container spacing={4}>
              {landingData.services.map((service, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card sx={{ height: '100%', textAlign: 'center' }}>
                    <CardContent>
                      <Box sx={{ color: 'primary.main', mb: 2 }}>
                        {getIconComponent(service.icon)}
                      </Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {service.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Testimonials Section */}
      {landingData.testimonials && landingData.testimonials.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            What Our Clients Say
          </Typography>
          <Grid container spacing={4}>
            {landingData.testimonials.map((testimonial, index) => (
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
      )}

      {/* Contact Section */}
      <Box id="contact" sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="h6" textAlign="center" sx={{ mb: 6, opacity: 0.9 }}>
            Get in touch with us for your construction needs
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            {landingData.contactEmail && (
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Email sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {landingData.contactEmail}
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {landingData.contactPhone && (
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Phone sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {landingData.contactPhone}
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {landingData.contactAddress && (
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <LocationOn sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Address
                  </Typography>
                  <Typography variant="body1">
                    {landingData.contactAddress}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Social Links */}
          {landingData.socialLinks && Object.keys(landingData.socialLinks).length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Typography variant="h6" gutterBottom>
                Follow Us
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                {Object.entries(landingData.socialLinks).map(([platform, url]) => (
                  <Button
                    key={platform}
                    component="a"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    sx={{ 
                      borderColor: 'white', 
                      color: 'white',
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    {getSocialIcon(platform)}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" textAlign="center">
            {landingData.footerText || '© 2024 Construction Services. All rights reserved.'}
          </Typography>
        </Container>
      </Box>

      {/* Custom JavaScript */}
      {landingData.customJS && (
        <script dangerouslySetInnerHTML={{ __html: landingData.customJS }} />
      )}
    </Box>
  );
};

export default CompanyLanding;