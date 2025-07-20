import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  useTheme
} from '@mui/material';
import {
  Business,
  People,
  Engineering,
  Assignment,
  Add,
  Edit,
  Delete,
  Visibility,
  Dashboard,
  Settings,
  SupervisedUserCircle,
  TrendingUp,
  Warning,
  CheckCircle,
  Cancel,
  Payment
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import SystemStatus from '../../components/SystemStatus';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SuperAdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const [tabValue, setTabValue] = useState(0);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog states
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    fetchOverviewData();
    fetchCompanies();
    fetchUsers();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const response = await fetch('/api/super-admin/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setOverviewData(data.data);
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/super-admin/companies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCompanies(data.data.companies);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/super-admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'default';
      case 'BASIC': return 'primary';
      case 'PROFESSIONAL': return 'secondary';
      case 'ENTERPRISE': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Super Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage the entire Construction SaaS Platform
        </Typography>
      </Box>

      {/* Overview Cards */}
      {overviewData && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Business sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {overviewData.totalCompanies}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Companies
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <People sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {overviewData.totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Engineering sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {overviewData.totalMachines}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Machines
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assignment sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {overviewData.totalContracts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Contracts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" icon={<Dashboard />} />
          <Tab label="Companies" icon={<Business />} />
          <Tab label="Users" icon={<People />} />
          <Tab label="Payments" icon={<Payment />} />
          <Tab label="Settings" icon={<Settings />} />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        {/* System Status */}
        <Grid item xs={12} sx={{ mb: 3 }}>
          <SystemStatus showDetails={true} />
        </Grid>
        
        <Grid container spacing={3}>
          {/* Recent Companies */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Companies
                </Typography>
                <List>
                  {overviewData?.recentCompanies?.map((company: any, index: number) => (
                    <React.Fragment key={company.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <Business />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={company.name}
                          secondary={`${company._count.users} users • ${company._count.machines} machines`}
                        />
                        <Chip
                          label={company.subscriptionPlan}
                          color={getSubscriptionColor(company.subscriptionPlan)}
                          size="small"
                        />
                      </ListItem>
                      {index < overviewData.recentCompanies.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Subscription Statistics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Subscription Distribution
                </Typography>
                {overviewData?.subscriptionStats?.map((stat: any) => (
                  <Box key={stat.subscriptionPlan} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {stat.subscriptionPlan}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {stat._count.subscriptionPlan}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${(stat._count.subscriptionPlan / overviewData.totalCompanies) * 100}%`,
                          height: '100%',
                          bgcolor: theme.palette.primary.main
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Companies Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCompanyDialogOpen(true)}
          >
            Create Company
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Subscription</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Users</TableCell>
                <TableCell>Machines</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        <Business />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{company.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {company.slug}.construction.com
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{company.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={company.subscriptionPlan}
                      color={getSubscriptionColor(company.subscriptionPlan)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={company.isActive ? 'Active' : 'Inactive'}
                      color={getStatusColor(company.isActive)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{company._count.users}</TableCell>
                  <TableCell>{company._count.machines}</TableCell>
                  <TableCell>
                    {new Date(company.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Users Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setUserDialogOpen(true)}
          >
            Create User
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        <SupervisedUserCircle />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.company?.name || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'ADMIN' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={getStatusColor(user.isActive)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Payments Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Payment Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage company subscription payments, billing, and revenue tracking.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Payment />}
          onClick={() => window.location.href = '/super-admin/payments'}
        >
          Go to Payment Management
        </Button>
      </TabPanel>

      {/* Settings Tab */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Platform Settings
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Maintenance Mode"
                      secondary="Enable maintenance mode for all companies"
                    />
                    <Chip label="Disabled" color="success" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Registration"
                      secondary="Allow new company registrations"
                    />
                    <Chip label="Enabled" color="success" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Default Plan"
                      secondary="Default subscription plan for new companies"
                    />
                    <Chip label="FREE" color="primary" size="small" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Platform Version"
                      secondary="1.0.0"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Database"
                      secondary="PostgreSQL 14"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Backup Frequency"
                      secondary="Daily"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Data Retention"
                      secondary="30 days"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Company Creation Dialog */}
      <Dialog open={companyDialogOpen} onClose={() => setCompanyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Company</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a new construction company with admin user
          </Typography>
          {/* Company creation form would go here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompanyDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Create Company</Button>
        </DialogActions>
      </Dialog>

      {/* User Creation Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a new user for a specific company
          </Typography>
          {/* User creation form would go here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Create User</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SuperAdminDashboard;