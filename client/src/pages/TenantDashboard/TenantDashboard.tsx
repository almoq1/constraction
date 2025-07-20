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
  Home,
  AttachMoney,
  CalendarToday,
  LocationOn,
  Logout,
  Refresh,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { accountsAPI } from '../../services/api';

interface TenantDashboardData {
  account: {
    id: string;
    tenantName: string;
    tenantPhone: string;
    rentalType: string;
    rentalId: string;
    startDate: string;
    monthlyRent: number;
    totalRentDue: number;
    totalRentPaid: number;
    remainingRent: number;
    advancePayments: number;
    lastPaymentDate: string;
  };
  rental: {
    id: string;
    land?: {
      id: string;
      name: string;
      location: string;
      size: number;
      description: string;
    };
    room?: {
      id: string;
      name: string;
      building: string;
      floor: number;
      roomNumber: string;
      size: number;
      description: string;
    };
  };
  statistics: {
    totalMonths: number;
    totalRentDue: number;
    totalRentPaid: number;
    remainingRent: number;
    advancePayments: number;
  };
}

const TenantDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<TenantDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await accountsAPI.getTenantDashboard();
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
    navigate('/tenant-login');
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

  const rentalInfo = dashboardData.rental.land || dashboardData.rental.room;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          {t('tenant.dashboard.title')} - {dashboardData.account.tenantName}
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
                    {t('tenant.dashboard.rentalDuration')}
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
                <AttachMoney color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('tenant.dashboard.monthlyRent')}
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(dashboardData.account.monthlyRent)}
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
                    {t('tenant.dashboard.totalPaid')}
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(dashboardData.statistics.totalRentPaid)}
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
                    {t('tenant.dashboard.remainingBalance')}
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(dashboardData.statistics.remainingRent)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Rental Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('tenant.dashboard.rentalInformation')}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('tenant.dashboard.rentalType')}
              </Typography>
              <Chip
                label={dashboardData.account.rentalType === 'LAND' ? t('common.land') : t('common.room')}
                color="primary"
                sx={{ mt: 1 }}
              />
            </Box>

            {rentalInfo && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {t('common.name')}
                  </Typography>
                  <Typography variant="body1">
                    {rentalInfo.name}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {t('common.location')}
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                    {dashboardData.rental.land?.location || `${rentalInfo.building} - Floor ${rentalInfo.floor}`}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {t('common.size')}
                  </Typography>
                  <Typography variant="body1">
                    {rentalInfo.size} m²
                  </Typography>
                </Box>

                {rentalInfo.description && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {t('common.description')}
                    </Typography>
                    <Typography variant="body1">
                      {rentalInfo.description}
                    </Typography>
                  </Box>
                )}
              </>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('tenant.dashboard.startDate')}
              </Typography>
              <Typography variant="body1">
                {formatDate(dashboardData.account.startDate)}
              </Typography>
            </Box>

            {dashboardData.account.lastPaymentDate && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  {t('tenant.dashboard.lastPayment')}
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
              {t('tenant.dashboard.financialSummary')}
            </Typography>
            
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {t('tenant.dashboard.totalRentDue')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(dashboardData.statistics.totalRentDue)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {t('tenant.dashboard.totalRentPaid')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" color="success.main" fontWeight="bold">
                        {formatCurrency(dashboardData.statistics.totalRentPaid)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {t('tenant.dashboard.advancePayments')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" color="info.main" fontWeight="bold">
                        {formatCurrency(dashboardData.statistics.advancePayments)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {t('tenant.dashboard.remainingBalance')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="error.main" fontWeight="bold">
                        {formatCurrency(dashboardData.statistics.remainingRent)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {dashboardData.statistics.remainingRent > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {t('tenant.dashboard.paymentDue')}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Payment History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('tenant.dashboard.paymentHistory')}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {t('tenant.dashboard.paymentHistoryNote')}
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
                  <TableRow>
                    <TableCell>{formatDate(dashboardData.account.startDate)}</TableCell>
                    <TableCell>{formatCurrency(dashboardData.statistics.advancePayments)}</TableCell>
                    <TableCell>
                      <Chip label={t('tenant.dashboard.advancePayment')} color="info" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={t('common.completed')} color="success" size="small" />
                    </TableCell>
                  </TableRow>
                  
                  {dashboardData.account.lastPaymentDate && (
                    <TableRow>
                      <TableCell>{formatDate(dashboardData.account.lastPaymentDate)}</TableCell>
                      <TableCell>{formatCurrency(dashboardData.statistics.totalRentPaid)}</TableCell>
                      <TableCell>
                        <Chip label={t('tenant.dashboard.rentPayment')} color="primary" size="small" />
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

export default TenantDashboard;