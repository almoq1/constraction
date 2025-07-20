import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  LinearProgress,
  Avatar,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Construction as ConstructionIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchDashboardData } from '../store/slices/dashboardSlice';

interface DashboardStats {
  totalMachines: number;
  activeContracts: number;
  totalDrivers: number;
  monthlyRevenue: number;
  machineUtilization: number;
  contractPerformance: number;
  recentPayments: Array<{
    id: string;
    amount: number;
    type: string;
    date: string;
    status: string;
  }>;
  upcomingAlerts: Array<{
    id: string;
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    dueDate: string;
    type: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMachines: 0,
    activeContracts: 0,
    totalDrivers: 0,
    monthlyRevenue: 0,
    machineUtilization: 0,
    contractPerformance: 0,
    recentPayments: [],
    upcomingAlerts: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Here you would typically fetch data from your API
      // For now, using mock data
      const mockStats: DashboardStats = {
        totalMachines: 25,
        activeContracts: 8,
        totalDrivers: 15,
        monthlyRevenue: 125000,
        machineUtilization: 78,
        contractPerformance: 85,
        recentPayments: [
          {
            id: '1',
            amount: 15000,
            type: 'contract',
            date: '2024-01-15',
            status: 'received'
          },
          {
            id: '2',
            amount: 8500,
            type: 'rent',
            date: '2024-01-14',
            status: 'received'
          },
          {
            id: '3',
            amount: 22000,
            type: 'contract',
            date: '2024-01-13',
            status: 'pending'
          }
        ],
        upcomingAlerts: [
          {
            id: '1',
            title: 'Rent Due',
            message: 'Land rental payment due in 3 days',
            priority: 'high',
            dueDate: '2024-01-18',
            type: 'rentDue'
          },
          {
            id: '2',
            title: 'Contract Expiry',
            message: 'Contract #CTR-2024-001 expires in 7 days',
            priority: 'medium',
            dueDate: '2024-01-22',
            type: 'contractExpiry'
          },
          {
            id: '3',
            title: 'Salary Due',
            message: 'Driver salary payment due in 5 days',
            priority: 'medium',
            dueDate: '2024-01-20',
            type: 'salaryDue'
          }
        ]
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'rentDue':
        return <PaymentIcon />;
      case 'contractExpiry':
        return <BusinessIcon />;
      case 'salaryDue':
        return <PeopleIcon />;
      case 'maintenance':
        return <ConstructionIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('dashboard.title')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadDashboardData}
        >
          {t('common.refresh')}
        </Button>
      </Box>

      {/* Welcome Message */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1">
          {t('dashboard.welcome', { name: user?.firstName || 'User' })}
        </Typography>
      </Alert>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('dashboard.totalMachines')}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.totalMachines}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    +12% from last month
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ConstructionIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('dashboard.activeContracts')}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.activeContracts}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    +5% from last month
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <BusinessIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('dashboard.totalDrivers')}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.totalDrivers}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    +3% from last month
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('dashboard.monthlyRevenue')}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatCurrency(stats.monthlyRevenue)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    +18% from last month
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <MoneyIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.machineUtilization')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="div" sx={{ mr: 2 }}>
                  {stats.machineUtilization}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={stats.machineUtilization}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                {stats.machineUtilization >= 80 ? 'Excellent utilization' : 
                 stats.machineUtilization >= 60 ? 'Good utilization' : 'Needs improvement'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.contractPerformance')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="div" sx={{ mr: 2 }}>
                  {stats.contractPerformance}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={stats.contractPerformance}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                {stats.contractPerformance >= 80 ? 'Excellent performance' : 
                 stats.contractPerformance >= 60 ? 'Good performance' : 'Needs attention'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Payments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('dashboard.recentPayments')}
                </Typography>
                <Button size="small" color="primary">
                  {t('dashboard.viewAll')}
                </Button>
              </Box>
              <List>
                {stats.recentPayments.map((payment, index) => (
                  <React.Fragment key={payment.id}>
                    <ListItem>
                      <ListItemIcon>
                        <PaymentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={formatCurrency(payment.amount)}
                        secondary={`${payment.type} • ${formatDate(payment.date)}`}
                      />
                      <Chip
                        label={payment.status}
                        color={getStatusColor(payment.status) as any}
                        size="small"
                      />
                    </ListItem>
                    {index < stats.recentPayments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('dashboard.upcomingAlerts')}
                </Typography>
                <Button size="small" color="primary">
                  {t('dashboard.viewAll')}
                </Button>
              </Box>
              <List>
                {stats.upcomingAlerts.map((alert, index) => (
                  <React.Fragment key={alert.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getAlertIcon(alert.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={alert.title}
                        secondary={`${alert.message} • Due: ${formatDate(alert.dueDate)}`}
                      />
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={alert.priority}
                          color={getPriorityColor(alert.priority) as any}
                          size="small"
                        />
                        <IconButton size="small">
                          <MoreVertIcon />
                        </IconButton>
                      </Stack>
                    </ListItem>
                    {index < stats.upcomingAlerts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button variant="contained" startIcon={<ConstructionIcon />}>
            {t('machines.addMachine')}
          </Button>
          <Button variant="contained" startIcon={<PeopleIcon />}>
            {t('drivers.addDriver')}
          </Button>
          <Button variant="contained" startIcon={<BusinessIcon />}>
            {t('contracts.addContract')}
          </Button>
          <Button variant="contained" startIcon={<PaymentIcon />}>
            {t('payments.addPayment')}
          </Button>
          <Button variant="outlined" startIcon={<NotificationsIcon />}>
            {t('alerts.addAlert')}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Dashboard;