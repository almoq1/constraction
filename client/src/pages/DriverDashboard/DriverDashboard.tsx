import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person,
  DirectionsCar,
  AttachMoney,
  Event,
  Work,
  Home,
  Add,
  CalendarToday,
  AccessTime,
  Payment,
  Assignment,
  Logout
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { accountsAPI } from '../../services/api';

interface DriverDashboardData {
  account: {
    id: string;
    startDate: string;
    totalWorkingDays: number;
    totalLeaveDays: number;
    netWorkingDays: number;
    totalSalaryEarned: number;
    totalSalaryPaid: number;
    remainingSalary: number;
    driver: {
      id: string;
      name: string;
      phone: string;
      licenseNumber: string;
      experience: number;
      salary: number;
      driverAssignments: Array<{
        id: string;
        machine: {
          id: string;
          name: string;
          type: string;
          model: string;
        };
        startDate: string;
        isActive: boolean;
      }>;
      salaryPayments: Array<{
        id: string;
        amount: number;
        date: string;
        description: string;
      }>;
      leaveRecords: Array<{
        id: string;
        startDate: string;
        endDate: string;
        leaveType: string;
        reason: string;
        isApproved: boolean;
      }>;
    };
  };
  currentMonth: {
    workingDays: number;
    leaveDays: number;
    netWorkingDays: number;
    salaryEarned: number;
    salaryPaid: number;
  };
  assignedMachines: Array<any>;
  recentPayments: Array<any>;
  recentLeaves: Array<any>;
}

const DriverDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DriverDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    reason: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await accountsAPI.getDriverDashboard();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.error || 'Failed to load dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/driver/login');
  };

  const handleLeaveRequest = async () => {
    try {
      const response = await accountsAPI.requestLeave(leaveForm);
      if (response.success) {
        setLeaveDialogOpen(false);
        setLeaveForm({ startDate: '', endDate: '', leaveType: '', reason: '' });
        fetchDashboardData(); // Refresh data
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to request leave');
    }
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

  if (!dashboardData) {
    return null;
  }

  const { account, currentMonth, assignedMachines, recentPayments, recentLeaves } = dashboardData;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              {t('driverDashboard.welcome')}, {account.driver.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('driverDashboard.license')}: {account.driver.licenseNumber}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
        >
          {t('common.logout')}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Work sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">{t('driverDashboard.totalWorkingDays')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {account.netWorkingDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('driverDashboard.since')} {new Date(account.startDate).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">{t('driverDashboard.totalSalaryEarned')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                ${account.totalSalaryEarned.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('driverDashboard.remaining')}: ${account.remainingSalary.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">{t('driverDashboard.currentMonth')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {currentMonth.netWorkingDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('driverDashboard.workingDays')} - {t('driverDashboard.leaveDays')}: {currentMonth.leaveDays}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DirectionsCar sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">{t('driverDashboard.assignedMachines')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {assignedMachines.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('driverDashboard.activeAssignments')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Assigned Machines */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('driverDashboard.assignedMachines')}
              </Typography>
              <List>
                {assignedMachines.map((assignment) => (
                  <ListItem key={assignment.id}>
                    <ListItemIcon>
                      <DirectionsCar color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={assignment.machine.name}
                      secondary={`${assignment.machine.type} - ${assignment.machine.model}`}
                    />
                    <Chip
                      label={assignment.isActive ? t('common.active') : t('common.inactive')}
                      color={assignment.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItem>
                ))}
                {assignedMachines.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary={t('driverDashboard.noMachinesAssigned')}
                      secondary={t('driverDashboard.contactManager')}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Payments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('driverDashboard.recentPayments')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('common.date')}</TableCell>
                      <TableCell>{t('common.amount')}</TableCell>
                      <TableCell>{t('common.description')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                      </TableRow>
                    ))}
                    {recentPayments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          {t('driverDashboard.noRecentPayments')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Leave History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('driverDashboard.leaveHistory')}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setLeaveDialogOpen(true)}
                >
                  {t('driverDashboard.requestLeave')}
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('common.startDate')}</TableCell>
                      <TableCell>{t('common.endDate')}</TableCell>
                      <TableCell>{t('common.type')}</TableCell>
                      <TableCell>{t('common.reason')}</TableCell>
                      <TableCell>{t('common.status')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentLeaves.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={t(`leaveTypes.${leave.leaveType.toLowerCase()}`)}
                            size="small"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>{leave.reason}</TableCell>
                        <TableCell>
                          <Chip
                            label={leave.isApproved ? t('common.approved') : t('common.pending')}
                            color={leave.isApproved ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {recentLeaves.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          {t('driverDashboard.noLeaveHistory')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Leave Request Dialog */}
      <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('driverDashboard.requestLeave')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('common.startDate')}
                type="date"
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('common.endDate')}
                type="date"
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('common.leaveType')}</InputLabel>
                <Select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, leaveType: e.target.value }))}
                  label={t('common.leaveType')}
                >
                  <MenuItem value="VACATION">{t('leaveTypes.vacation')}</MenuItem>
                  <MenuItem value="SICK">{t('leaveTypes.sick')}</MenuItem>
                  <MenuItem value="PERSONAL">{t('leaveTypes.personal')}</MenuItem>
                  <MenuItem value="OTHER">{t('leaveTypes.other')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('common.reason')}
                multiline
                rows={3}
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleLeaveRequest} variant="contained">
            {t('common.submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DriverDashboard;