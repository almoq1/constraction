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
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Payment,
  AttachMoney,
  Schedule,
  Warning,
  CheckCircle,
  Cancel,
  Add,
  Edit,
  Delete,
  Visibility,
  Receipt,
  TrendingUp,
  Business,
  ExpandMore,
  DateRange,
  FilterList
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

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
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SuperAdminPayments: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const [tabValue, setTabValue] = useState(0);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [overduePayments, setOverduePayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [generateBillsDialogOpen, setGenerateBillsDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    companyId: '',
    subscriptionPlanId: '',
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    billingCycle: 'MONTHLY',
    billingPeriod: '',
    dueDate: new Date(),
    transactionId: '',
    receiptNumber: '',
    notes: ''
  });

  const [statusForm, setStatusForm] = useState({
    paymentStatus: 'PENDING',
    paidDate: new Date(),
    transactionId: '',
    receiptNumber: '',
    notes: ''
  });

  const [billsForm, setBillsForm] = useState({
    billingPeriod: '',
    dueDate: new Date()
  });

  useEffect(() => {
    fetchPaymentOverview();
    fetchPayments();
    fetchOverduePayments();
    fetchCompanies();
    fetchSubscriptionPlans();
  }, []);

  const fetchPaymentOverview = async () => {
    try {
      const response = await fetch('/api/super-admin/payments/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setOverviewData(data.data);
      }
    } catch (error) {
      console.error('Error fetching payment overview:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/super-admin/payments/payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchOverduePayments = async () => {
    try {
      const response = await fetch('/api/super-admin/payments/overdue', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setOverduePayments(data.data);
      }
    } catch (error) {
      console.error('Error fetching overdue payments:', error);
    } finally {
      setLoading(false);
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

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await fetch('/api/super-admin/subscription-plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSubscriptionPlans(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warning';
      case 'OVERDUE': return 'error';
      case 'CANCELLED': return 'default';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'CASH': return 'success';
      case 'BANK_TRANSFER': return 'primary';
      case 'HESABPAY': return 'secondary';
      case 'CREDIT_CARD': return 'info';
      case 'DEBIT_CARD': return 'warning';
      default: return 'default';
    }
  };

  const handleCreatePayment = async () => {
    try {
      const response = await fetch('/api/super-admin/payments/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...paymentForm,
          dueDate: paymentForm.dueDate.toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        setPaymentDialogOpen(false);
        setPaymentForm({
          companyId: '',
          subscriptionPlanId: '',
          amount: '',
          paymentMethod: 'BANK_TRANSFER',
          billingCycle: 'MONTHLY',
          billingPeriod: '',
          dueDate: new Date(),
          transactionId: '',
          receiptNumber: '',
          notes: ''
        });
        fetchPayments();
        fetchPaymentOverview();
      } else {
        setError(data.error || 'Failed to create payment');
      }
    } catch (error) {
      setError('Failed to create payment');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`/api/super-admin/payments/payments/${selectedPayment.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...statusForm,
          paidDate: statusForm.paidDate.toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        setStatusDialogOpen(false);
        setSelectedPayment(null);
        setStatusForm({
          paymentStatus: 'PENDING',
          paidDate: new Date(),
          transactionId: '',
          receiptNumber: '',
          notes: ''
        });
        fetchPayments();
        fetchPaymentOverview();
        fetchOverduePayments();
      } else {
        setError(data.error || 'Failed to update payment status');
      }
    } catch (error) {
      setError('Failed to update payment status');
    }
  };

  const handleGenerateBills = async () => {
    try {
      const response = await fetch('/api/super-admin/payments/generate-bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...billsForm,
          dueDate: billsForm.dueDate.toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        setGenerateBillsDialogOpen(false);
        setBillsForm({
          billingPeriod: '',
          dueDate: new Date()
        });
        fetchPayments();
        fetchPaymentOverview();
      } else {
        setError(data.error || 'Failed to generate bills');
      }
    } catch (error) {
      setError('Failed to generate bills');
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Payment Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage company subscription payments and billing
        </Typography>
      </Box>

      {/* Overview Cards */}
      {overviewData && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Payment sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {overviewData.totalPayments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Payments
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
                  <AttachMoney sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      ${overviewData.totalAmount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
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
                  <Schedule sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {overviewData.pendingPayments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Payments
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
                  <Warning sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {overviewData.overduePayments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overdue Payments
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
          <Tab label="Overview" icon={<TrendingUp />} />
          <Tab label="All Payments" icon={<Payment />} />
          <Tab label="Overdue" icon={<Warning />} />
          <Tab label="Reports" icon={<Receipt />} />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Recent Payments */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Payments
                </Typography>
                <List>
                  {overviewData?.recentPayments?.map((payment: any, index: number) => (
                    <React.Fragment key={payment.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <Business />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${payment.company.name} - $${payment.amount}`}
                          secondary={`${payment.subscriptionPlan.name} • ${new Date(payment.createdAt).toLocaleDateString()}`}
                        />
                        <Chip
                          label={payment.paymentStatus}
                          color={getPaymentStatusColor(payment.paymentStatus)}
                          size="small"
                        />
                      </ListItem>
                      {index < overviewData.recentPayments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Methods */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Methods
                </Typography>
                {overviewData?.paymentMethodsStats?.map((stat: any) => (
                  <Box key={stat.paymentMethod} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {stat.paymentMethod}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ${stat._sum.amount?.toFixed(2) || '0.00'}
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
                          width: `${(stat._sum.amount / overviewData.totalAmount) * 100}%`,
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

          {/* Upcoming Payments */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Payments (Next 30 Days)
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Company</TableCell>
                        <TableCell>Plan</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {overviewData?.upcomingPayments?.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.company.name}</TableCell>
                          <TableCell>{payment.subscriptionPlan.name}</TableCell>
                          <TableCell>${payment.amount}</TableCell>
                          <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip
                              label={payment.paymentStatus}
                              color={getPaymentStatusColor(payment.paymentStatus)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* All Payments Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setPaymentDialogOpen(true)}
          >
            Create Payment
          </Button>
          <Button
            variant="outlined"
            startIcon={<Receipt />}
            onClick={() => setGenerateBillsDialogOpen(true)}
          >
            Generate Bills
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        <Business />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{payment.company.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {payment.company.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{payment.subscriptionPlan.name}</TableCell>
                  <TableCell>${payment.amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.paymentMethod}
                      color={getPaymentMethodColor(payment.paymentMethod)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payment.paymentStatus}
                      color={getPaymentStatusColor(payment.paymentStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setStatusForm({
                          paymentStatus: payment.paymentStatus,
                          paidDate: new Date(),
                          transactionId: payment.transactionId || '',
                          receiptNumber: payment.receiptNumber || '',
                          notes: payment.notes || ''
                        });
                        setStatusDialogOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Overdue Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Overdue Payments ({overduePayments.length})
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Days Overdue</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {overduePayments.map((payment) => {
                const daysOverdue = Math.ceil((new Date().getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>
                          <Business />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{payment.company.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {payment.company.slug}.construction.com
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{payment.company.email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {payment.company.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>{payment.subscriptionPlan.name}</TableCell>
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${daysOverdue} days`}
                        color={daysOverdue > 30 ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setStatusForm({
                            paymentStatus: 'PAID',
                            paidDate: new Date(),
                            transactionId: '',
                            receiptNumber: '',
                            notes: ''
                          });
                          setStatusDialogOpen(true);
                        }}
                      >
                        <CheckCircle />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Reports Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Payment Reports
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Detailed payment analytics and reporting features will be implemented here.
        </Typography>
      </TabPanel>

      {/* Create Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Payment Record</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Company</InputLabel>
                <Select
                  value={paymentForm.companyId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, companyId: e.target.value })}
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Subscription Plan</InputLabel>
                <Select
                  value={paymentForm.subscriptionPlanId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, subscriptionPlanId: e.target.value })}
                >
                  {subscriptionPlans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name} - ${plan.price}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                >
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                  <MenuItem value="HESABPAY">HesabPay</MenuItem>
                  <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                  <MenuItem value="DEBIT_CARD">Debit Card</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Billing Period (e.g., 2024-01)"
                value={paymentForm.billingPeriod}
                onChange={(e) => setPaymentForm({ ...paymentForm, billingPeriod: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={paymentForm.dueDate}
                  onChange={(date) => setPaymentForm({ ...paymentForm, dueDate: date || new Date() })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Transaction ID"
                value={paymentForm.transactionId}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Receipt Number"
                value={paymentForm.receiptNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, receiptNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePayment}>Create Payment</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={statusForm.paymentStatus}
                  onChange={(e) => setStatusForm({ ...statusForm, paymentStatus: e.target.value })}
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="OVERDUE">Overdue</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Paid Date"
                  value={statusForm.paidDate}
                  onChange={(date) => setStatusForm({ ...statusForm, paidDate: date || new Date() })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Transaction ID"
                value={statusForm.transactionId}
                onChange={(e) => setStatusForm({ ...statusForm, transactionId: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Receipt Number"
                value={statusForm.receiptNumber}
                onChange={(e) => setStatusForm({ ...statusForm, receiptNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={statusForm.notes}
                onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateStatus}>Update Status</Button>
        </DialogActions>
      </Dialog>

      {/* Generate Bills Dialog */}
      <Dialog open={generateBillsDialogOpen} onClose={() => setGenerateBillsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Monthly Bills</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Billing Period (e.g., 2024-01)"
                value={billsForm.billingPeriod}
                onChange={(e) => setBillsForm({ ...billsForm, billingPeriod: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={billsForm.dueDate}
                  onChange={(date) => setBillsForm({ ...billsForm, dueDate: date || new Date() })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateBillsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerateBills}>Generate Bills</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SuperAdminPayments;