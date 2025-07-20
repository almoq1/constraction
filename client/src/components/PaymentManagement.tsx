import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Payment as PaymentIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Payment {
  id: string;
  paymentNumber: string;
  type: 'salary' | 'rent' | 'contract' | 'utility' | 'maintenance' | 'other';
  category: 'income' | 'expense';
  amount: number;
  date: string;
  dueDate?: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  description: string;
  recipient?: string;
  payer?: string;
  reference?: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'credit_card';
  attachments?: string[];
}

const PaymentManagement: React.FC = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const [formData, setFormData] = useState({
    paymentNumber: '',
    type: 'other' as 'salary' | 'rent' | 'contract' | 'utility' | 'maintenance' | 'other',
    category: 'expense' as 'income' | 'expense',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'pending' as 'paid' | 'pending' | 'overdue' | 'cancelled',
    description: '',
    recipient: '',
    payer: '',
    reference: '',
    paymentMethod: 'cash' as 'cash' | 'bank_transfer' | 'check' | 'credit_card'
  });

  const typeOptions = [
    { value: 'salary', label: 'Salary Payment', icon: <PaymentIcon /> },
    { value: 'rent', label: 'Rent Payment', icon: <MoneyIcon /> },
    { value: 'contract', label: 'Contract Payment', icon: <ReceiptIcon /> },
    { value: 'utility', label: 'Utility Payment', icon: <AccountBalanceIcon /> },
    { value: 'maintenance', label: 'Maintenance Payment', icon: <ScheduleIcon /> },
    { value: 'other', label: 'Other Payment', icon: <PaymentIcon /> }
  ];

  const statusOptions = [
    { value: 'paid', label: 'Paid', color: 'success' },
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'overdue', label: 'Overdue', color: 'error' },
    { value: 'cancelled', label: 'Cancelled', color: 'default' }
  ];

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'credit_card', label: 'Credit Card' }
  ];

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockPayments: Payment[] = [
        {
          id: '1',
          paymentNumber: 'PAY-2024-001',
          type: 'salary',
          category: 'expense',
          amount: 3500,
          date: '2024-01-01',
          status: 'paid',
          description: 'Monthly salary for John Doe',
          recipient: 'John Doe',
          paymentMethod: 'bank_transfer',
          reference: 'SAL-001'
        },
        {
          id: '2',
          paymentNumber: 'PAY-2024-002',
          type: 'rent',
          category: 'income',
          amount: 5000,
          date: '2024-01-01',
          status: 'paid',
          description: 'Monthly rent for Commercial Land Plot A',
          payer: 'John Smith',
          paymentMethod: 'cash',
          reference: 'RENT-001'
        },
        {
          id: '3',
          paymentNumber: 'PAY-2024-003',
          type: 'contract',
          category: 'income',
          amount: 50000,
          date: '2024-01-01',
          status: 'paid',
          description: 'Advance payment for highway construction project',
          payer: 'ABC Construction Co.',
          paymentMethod: 'bank_transfer',
          reference: 'CTR-001'
        },
        {
          id: '4',
          paymentNumber: 'PAY-2024-004',
          type: 'utility',
          category: 'expense',
          amount: 500,
          date: '2024-01-15',
          dueDate: '2024-01-20',
          status: 'overdue',
          description: 'Electricity bill for office',
          paymentMethod: 'credit_card',
          reference: 'UTIL-001'
        },
        {
          id: '5',
          paymentNumber: 'PAY-2024-005',
          type: 'maintenance',
          category: 'expense',
          amount: 1200,
          date: '2024-01-20',
          status: 'pending',
          description: 'Machine maintenance service',
          paymentMethod: 'check',
          reference: 'MAINT-001'
        }
      ];
      
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      setSnackbar({
        open: true,
        message: 'Error loading payments',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (payment?: Payment) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        paymentNumber: payment.paymentNumber,
        type: payment.type,
        category: payment.category,
        amount: payment.amount,
        date: payment.date,
        dueDate: payment.dueDate || '',
        status: payment.status,
        description: payment.description,
        recipient: payment.recipient || '',
        payer: payment.payer || '',
        reference: payment.reference || '',
        paymentMethod: payment.paymentMethod
      });
    } else {
      setEditingPayment(null);
      setFormData({
        paymentNumber: '',
        type: 'other',
        category: 'expense',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        status: 'pending',
        description: '',
        recipient: '',
        payer: '',
        reference: '',
        paymentMethod: 'cash'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPayment(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingPayment) {
        // Update existing payment
        const updatedPayment = { ...editingPayment, ...formData };
        setPayments(payments.map(p => p.id === editingPayment.id ? updatedPayment : p));
        setSnackbar({
          open: true,
          message: 'Payment updated successfully',
          severity: 'success'
        });
      } else {
        // Add new payment
        const newPayment: Payment = {
          id: Date.now().toString(),
          ...formData
        };
        setPayments([...payments, newPayment]);
        setSnackbar({
          open: true,
          message: 'Payment added successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving payment',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (paymentId: string) => {
    try {
      setPayments(payments.filter(p => p.id !== paymentId));
      setSnackbar({
        open: true,
        message: 'Payment deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting payment',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || 'default';
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

  const getTypeIcon = (type: string) => {
    const typeOption = typeOptions.find(t => t.value === type);
    return typeOption?.icon || <PaymentIcon />;
  };

  const calculateStats = () => {
    const totalIncome = payments
      .filter(p => p.category === 'income' && p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalExpenses = payments
      .filter(p => p.category === 'expense' && p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const pendingAmount = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const overdueAmount = payments
      .filter(p => p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      pendingAmount,
      overdueAmount
    };
  };

  const stats = calculateStats();

  const filteredPayments = activeTab === 0 
    ? payments.filter(p => p.category === 'income')
    : payments.filter(p => p.category === 'expense');

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PaymentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            {t('payments.title')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadPayments}
          >
            {t('common.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('payments.addPayment')}
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography color="textSecondary">
                  Total Income
                </Typography>
              </Box>
              <Typography variant="h5" color="success.main">
                {formatCurrency(stats.totalIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingDownIcon color="error" />
                <Typography color="textSecondary">
                  Total Expenses
                </Typography>
              </Box>
              <Typography variant="h5" color="error.main">
                {formatCurrency(stats.totalExpenses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccountBalanceIcon color="primary" />
                <Typography color="textSecondary">
                  Net Income
                </Typography>
              </Box>
              <Typography variant="h5" color={stats.netIncome >= 0 ? 'success.main' : 'error.main'}>
                {formatCurrency(stats.netIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ScheduleIcon color="warning" />
                <Typography color="textSecondary">
                  Pending
                </Typography>
              </Box>
              <Typography variant="h5" color="warning.main">
                {formatCurrency(stats.pendingAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WarningIcon color="error" />
                <Typography color="textSecondary">
                  Overdue
                </Typography>
              </Box>
              <Typography variant="h5" color="error.main">
                {formatCurrency(stats.overdueAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for Income and Expenses */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon />
                Income ({payments.filter(p => p.category === 'income').length})
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingDownIcon />
                Expenses ({payments.filter(p => p.category === 'expense').length})
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {/* Payments Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payment</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Recipient/Payer</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {payment.paymentNumber}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {payment.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(payment.type)}
                        <Typography variant="body2">
                          {typeOptions.find(t => t.value === payment.type)?.label}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        color={payment.category === 'income' ? 'success.main' : 'error.main'}
                      >
                        {payment.category === 'income' ? '+' : '-'}{formatCurrency(payment.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {formatDate(payment.date)}
                        </Typography>
                        {payment.dueDate && (
                          <Typography variant="caption" color="textSecondary">
                            Due: {formatDate(payment.dueDate)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusOptions.find(s => s.value === payment.status)?.label}
                        color={getStatusColor(payment.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {paymentMethodOptions.find(m => m.value === payment.paymentMethod)?.label}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.recipient || payment.payer || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Payment">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(payment)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Payment">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(payment.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Payment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPayment ? t('payments.editPayment') : t('payments.addPayment')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payment Number"
                value={formData.paymentNumber}
                onChange={(e) => setFormData({ ...formData, paymentNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  label="Category"
                >
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  label="Type"
                >
                  {typeOptions.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount ($)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date (Optional)"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  label="Status"
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  label="Payment Method"
                >
                  {paymentMethodOptions.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={formData.category === 'income' ? 'Payer' : 'Recipient'}
                value={formData.category === 'income' ? formData.payer : formData.recipient}
                onChange={(e) => {
                  if (formData.category === 'income') {
                    setFormData({ ...formData, payer: e.target.value });
                  } else {
                    setFormData({ ...formData, recipient: e.target.value });
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reference"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPayment ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PaymentManagement;