import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  ExpandMore,
  ExpandLess,
  Storage,
  People,
  Business,
  Payment,
  Settings
} from '@mui/icons-material';

interface SystemStatusProps {
  showDetails?: boolean;
}

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  database: string;
  system: {
    totalCompanies: number;
    totalUsers: number;
    totalPayments: number;
    activeCompanies: number;
  };
  version: string;
  features: {
    multiTenant: boolean;
    superAdmin: boolean;
    paymentManagement: boolean;
    subscriptionPlans: boolean;
    customLandingPages: boolean;
  };
}

const SystemStatus: React.FC<SystemStatusProps> = ({ showDetails = false }) => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(showDetails);

  useEffect(() => {
    fetchHealthStatus();
    const interval = setInterval(fetchHealthStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      if (response.ok) {
        setHealthData(data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch system status');
      }
    } catch (error) {
      setError('Unable to connect to the system');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'unhealthy':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle />;
      case 'degraded':
        return <Warning />;
      case 'unhealthy':
        return <Error />;
      default:
        return <Error />;
    }
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Checking system status...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            <Typography variant="h6" gutterBottom>
              System Status Unavailable
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!healthData) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="h2">
            System Status
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={getStatusIcon(healthData.status)}
              label={healthData.status.toUpperCase()}
              color={getStatusColor(healthData.status)}
              size="small"
            />
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Business sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {healthData.system.totalCompanies}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Companies
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {healthData.system.totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Payment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {healthData.system.totalPayments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Payments
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Storage sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {healthData.system.activeCompanies}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Companies
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Collapse in={expanded}>
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Settings />
                    </ListItemIcon>
                    <ListItemText
                      primary="Environment"
                      secondary={healthData.environment}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Storage />
                    </ListItemIcon>
                    <ListItemText
                      primary="Database"
                      secondary={healthData.database}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle />
                    </ListItemIcon>
                    <ListItemText
                      primary="Version"
                      secondary={healthData.version}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Warning />
                    </ListItemIcon>
                    <ListItemText
                      primary="Uptime"
                      secondary={formatUptime(healthData.uptime)}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Features Status
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip
                    icon={healthData.features.multiTenant ? <CheckCircle /> : <Error />}
                    label="Multi-tenant Architecture"
                    color={healthData.features.multiTenant ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip
                    icon={healthData.features.superAdmin ? <CheckCircle /> : <Error />}
                    label="Super Admin System"
                    color={healthData.features.superAdmin ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip
                    icon={healthData.features.paymentManagement ? <CheckCircle /> : <Error />}
                    label="Payment Management"
                    color={healthData.features.paymentManagement ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip
                    icon={healthData.features.subscriptionPlans ? <CheckCircle /> : <Error />}
                    label="Subscription Plans"
                    color={healthData.features.subscriptionPlans ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip
                    icon={healthData.features.customLandingPages ? <CheckCircle /> : <Error />}
                    label="Custom Landing Pages"
                    color={healthData.features.customLandingPages ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Last updated: {new Date(healthData.timestamp).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;