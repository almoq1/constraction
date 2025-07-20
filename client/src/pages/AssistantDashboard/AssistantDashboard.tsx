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
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Work,
  AttachMoney,
  DirectionsCar,
  Event,
  Add,
  Logout,
  Refresh,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { accountsAPI } from '../../services/api';

interface AssistantDashboardData {
  account: {
    id: string;
    startDate: string;
    totalWorkingDays: number;
    totalLeaveDays: number;
    netWorkingDays: number;
    totalSalaryEarned: number;
    totalSalaryPaid: number;
    remainingSalary: number;
    assistant: {
      id: string;
      name: string;
      phone: string;
      salary: number;
      driverAssignments: Array<{
        id: string;
        machine: {
          id: string;
          name: string;
          type: string;
          isAvailable: boolean;
        };
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
  assignedMachines: Array<{
    id: string;
    machine: {
      id: string;
      name: string;
      type: string;
      isAvailable: boolean;
    };
    isActive: boolean;
  }>;
  recentPayments: Array<{
    id: string;
    amount: number;
    date: string;
    description: string;
  }>;
  recentLeaves: Array<{
    id: string;
    startDate: string;
    endDate: string;
    leaveType: string;
    reason: string;
    isApproved: boolean;
  }>;
}

const AssistantDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<AssistantDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    reason: '',
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await accountsAPI.getAssistantDashboard();
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
    navigate('/assistant-login');
  };

  const handleLeaveSubmit = async () => {
    try {
      setSubmittingLeave(true);
      const response = await accountsAPI.requestLeave(leaveForm);
      if (response.success) {
        setLeaveDialogOpen(false);
        setLeaveForm({ startDate: '', endDate: '', leaveType: '', reason: '' });
        fetchDashboardData(); // Refresh data
      } else {
        setError(response.error || t('leave.request.error'));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('leave.request.error'));
    } finally {
      setSubmittingLeave(false);
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'VACATION': return 'success';
      case 'SICK': return 'error';
      case 'PERSONAL': return 'warning';
      default: return 'default';
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'VACATION': return t('leave.types.vacation');
      case 'SICK': return t('leave.types.sick');
      case 'PERSONAL': return t('leave.types.personal');
      default: return t('leave.types.other');
    }
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
          {t('assistant.dashboard.title')} - {dashboardData.account.assistant.name}
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
                <Work color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('assistant.dashboard.totalWorkingDays')}
                  </Typography>
                  <Typography variant="h5">
                    {dashboardData.account.netWorkingDays}
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
                    {t('assistant.dashboard.totalSalary')}
                  </Typography>
                  <Typography variant="h5">
                    ${dashboardData.account.totalSalaryEarned.toFixed(2)}
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
                    {t('assistant.dashboard.remainingSalary')}
                  </Typography>
                  <Typography variant="h5">
                    ${dashboardData.account.remainingSalary.toFixed(2)}
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
                    {t('assistant.dashboard.assignedMachines')}
                  </Typography>
                  <Typography variant="h5">
                    {dashboardData.assignedMachines.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Month Statistics */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('assistant.dashboard.currentMonth')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="textSecondary">
              {t('assistant.dashboard.workingDays')}
            </Typography>
            <Typography variant="h6">
              {dashboardData.currentMonth.workingDays}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="textSecondary">
              {t('assistant.dashboard.leaveDays')}
            </Typography>
            <Typography variant="h6">
              {dashboardData.currentMonth.leaveDays}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="textSecondary">
              {t('assistant.dashboard.netWorkingDays')}
            </Typography>
            <Typography variant="h6">
              {dashboardData.currentMonth.netWorkingDays}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="textSecondary">
              {t('assistant.dashboard.salaryEarned')}
            </Typography>
            <Typography variant="h6">
              ${dashboardData.currentMonth.salaryEarned.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Assigned Machines */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('assistant.dashboard.assignedMachines')}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.name')}</TableCell>
                    <TableCell>{t('common.type')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.assignedMachines.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.machine.name}</TableCell>
                      <TableCell>{assignment.machine.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={assignment.machine.isAvailable ? t('common.active') : t('common.inactive')}
                          color={assignment.machine.isAvailable ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Payments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('assistant.dashboard.recentPayments')}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.date')}</TableCell>
                    <TableCell>{t('common.amount')}</TableCell>
                    <TableCell>{t('common.description')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Leave History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                {t('assistant.dashboard.leaveHistory')}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setLeaveDialogOpen(true)}
              >
                {t('leave.request.button')}
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
                  {dashboardData.recentLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={getLeaveTypeLabel(leave.leaveType)}
                          color={getLeaveTypeColor(leave.leaveType) as any}
                          size="small"
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
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Leave Request Dialog */}
      <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('leave.request.title')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('common.startDate')}
                type="date"
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('common.endDate')}
                type="date"
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('common.type')}</InputLabel>
                <Select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  label={t('common.type')}
                >
                  <MenuItem value="VACATION">{t('leave.types.vacation')}</MenuItem>
                  <MenuItem value="SICK">{t('leave.types.sick')}</MenuItem>
                  <MenuItem value="PERSONAL">{t('leave.types.personal')}</MenuItem>
                  <MenuItem value="OTHER">{t('leave.types.other')}</MenuItem>
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
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleLeaveSubmit}
            variant="contained"
            disabled={submittingLeave}
          >
            {submittingLeave ? <CircularProgress size={20} /> : t('common.submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssistantDashboard;