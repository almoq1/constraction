import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  DirectionsCar,
  AttachMoney,
  CalendarToday,
  LocationOn,
  Logout,
  Refresh,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { accountsAPI } from '../../services/api';

interface MachineParkerDashboardData {
  account: {
    id: string;
    parkerName: string;
    parkerPhone: string;
    landId: string;
    startDate: string;
    totalMachines: number;
    farePerMachine: number;
    totalFareDue: number;
    totalFarePaid: number;
    remainingFare: number;
    lastPaymentDate: string;
  };
  land: {
    id: string;
    name: string;
    location: string;
    size: number;
    description: string;
  };
  statistics: {
    totalMonths: number;
    totalFareDue: number;
    totalFarePaid: number;
    remainingFare: number;
    monthlyFare: number;
  };
}

const MachineParkerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<MachineParkerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await accountsAPI.getMachineParkerDashboard();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.error || t('dashboard.error'));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('dashboard.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('accountType');
    navigate('/machine-parker-login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={fetchDashboardData} startIcon={<Refresh />}>
          {t('common.retry')}
        </Button>
      </Container>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          {t('machineParker.dashboard.title')} - {dashboardData.account.parkerName}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
        >
          {t('common.logout')}
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CalendarToday color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('machineParker.dashboard.parkingDuration')}
                  </Typography>
                  <Typography variant="h5">
                    {dashboardData.statistics.totalMonths} {t('common.months')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <DirectionsCar color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('machineParker.dashboard.totalMachines')}
                  </Typography>
                  <Typography variant="h5">
                    {dashboardData.account.totalMachines}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('machineParker.dashboard.totalPaid')}
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(dashboardData.statistics.totalFarePaid)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('machineParker.dashboard.remainingBalance')}
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(dashboardData.statistics.remainingFare)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Parking Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('machineParker.dashboard.parkingInformation')}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('common.land')}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                {dashboardData.land.name}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('common.location')}
              </Typography>
              <Typography variant="body1">
                {dashboardData.land.location}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('common.size')}
              </Typography>
              <Typography variant="body1">
                {dashboardData.land.size} m²
              </Typography>
            </Box>

            {dashboardData.land.description && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  {t('common.description')}
                </Typography>
                <Typography variant="body1">
                  {dashboardData.land.description}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('machineParker.dashboard.startDate')}
              </Typography>
              <Typography variant="body1">
                {formatDate(dashboardData.account.startDate)}
              </Typography>
            </Box>

            {dashboardData.account.lastPaymentDate && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  {t('machineParker.dashboard.lastPayment')}
                </Typography>
                <Typography variant="body1">
                  {formatDate(dashboardData.account.lastPaymentDate)}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Financial Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('machineParker.dashboard.financialSummary')}
            </Typography>
            
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {t('machineParker.dashboard.farePerMachine')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(dashboardData.account.farePerMachine)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {t('machineParker.dashboard.monthlyFare')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(dashboardData.statistics.monthlyFare)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {t('machineParker.dashboard.totalFareDue')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(dashboardData.statistics.totalFareDue)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {t('machineParker.dashboard.totalFarePaid')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" color="success.main" fontWeight="bold">
                        {formatCurrency(dashboardData.statistics.totalFarePaid)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {t('machineParker.dashboard.remainingBalance')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="error.main" fontWeight="bold">
                        {formatCurrency(dashboardData.statistics.remainingFare)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {dashboardData.statistics.remainingFare > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {t('machineParker.dashboard.paymentDue')}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Machine Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('machineParker.dashboard.machineDetails')}
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.machine')}</TableCell>
                    <TableCell>{t('common.fare')}</TableCell>
                    <TableCell>{t('common.monthlyTotal')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: dashboardData.account.totalMachines }, (_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body1">
                          {t('machineParker.dashboard.machine')} #{index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">
                          {formatCurrency(dashboardData.account.farePerMachine)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          {formatCurrency(dashboardData.account.farePerMachine)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {t('common.total')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {formatCurrency(dashboardData.account.farePerMachine * dashboardData.account.totalMachines)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(dashboardData.statistics.monthlyFare)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Payment History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('machineParker.dashboard.paymentHistory')}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {t('machineParker.dashboard.paymentHistoryNote')}
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.date')}</TableCell>
                    <TableCell>{t('common.amount')}</TableCell>
                    <TableCell>{t('common.type')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.account.lastPaymentDate && (
                    <TableRow>
                      <TableCell>{formatDate(dashboardData.account.lastPaymentDate)}</TableCell>
                      <TableCell>{formatCurrency(dashboardData.statistics.totalFarePaid)}</TableCell>
                      <TableCell>
                        <Chip label={t('machineParker.dashboard.farePayment')} color="primary" size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={t('common.completed')} color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MachineParkerDashboard;