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
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Work as WorkIcon,
  Vacation as VacationIcon,
  Payment as PaymentIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  experience: number;
  salary: number;
  status: 'active' | 'inactive' | 'onVacation' | 'sick';
  assignedMachine?: string;
  workingHours: number;
  vacationDays: number;
  assistants: Assistant[];
  salaryPayments: SalaryPayment[];
}

interface Assistant {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  salary: number;
  status: 'active' | 'inactive';
  workingHours: number;
}

interface SalaryPayment {
  id: string;
  amount: number;
  date: string;
  type: 'full' | 'partial';
  description: string;
}

const DriverManagement: React.FC = () => {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssistantDialog, setOpenAssistantDialog] = useState(false);
  const [openSalaryDialog, setOpenSalaryDialog] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    licenseNumber: '',
    experience: 0,
    salary: 0,
    status: 'active' as const
  });

  const [assistantFormData, setAssistantFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    salary: 0,
    status: 'active' as const
  });

  const [salaryFormData, setSalaryFormData] = useState({
    amount: 0,
    type: 'full' as 'full' | 'partial',
    description: ''
  });

  const statusOptions = [
    { value: 'active', label: t('drivers.active'), color: 'success' },
    { value: 'inactive', label: t('drivers.inactive'), color: 'default' },
    { value: 'onVacation', label: t('drivers.onVacation'), color: 'warning' },
    { value: 'sick', label: t('drivers.sick'), color: 'error' }
  ];

  const machines = [
    { id: '1', name: 'Excavator-001' },
    { id: '2', name: 'Bulldozer-001' },
    { id: '3', name: 'Crane-001' }
  ];

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockDrivers: Driver[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1 (555) 123-4567',
          email: 'john.doe@example.com',
          licenseNumber: 'DL-123456',
          experience: 5,
          salary: 3500,
          status: 'active',
          assignedMachine: 'Excavator-001',
          workingHours: 160,
          vacationDays: 15,
          assistants: [
            {
              id: '1',
              firstName: 'Mike',
              lastName: 'Johnson',
              phone: '+1 (555) 234-5678',
              salary: 2500,
              status: 'active',
              workingHours: 160
            }
          ],
          salaryPayments: [
            {
              id: '1',
              amount: 3500,
              date: '2024-01-01',
              type: 'full',
              description: 'Monthly salary'
            }
          ]
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1 (555) 345-6789',
          email: 'jane.smith@example.com',
          licenseNumber: 'DL-789012',
          experience: 3,
          salary: 3200,
          status: 'onVacation',
          workingHours: 120,
          vacationDays: 5,
          assistants: [],
          salaryPayments: []
        }
      ];
      
      setDrivers(mockDrivers);
    } catch (error) {
      console.error('Error loading drivers:', error);
      setSnackbar({
        open: true,
        message: 'Error loading drivers',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone,
        email: driver.email,
        licenseNumber: driver.licenseNumber,
        experience: driver.experience,
        salary: driver.salary,
        status: driver.status
      });
    } else {
      setEditingDriver(null);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        licenseNumber: '',
        experience: 0,
        salary: 0,
        status: 'active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDriver(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingDriver) {
        // Update existing driver
        const updatedDriver = { ...editingDriver, ...formData };
        setDrivers(drivers.map(d => d.id === editingDriver.id ? updatedDriver : d));
        setSnackbar({
          open: true,
          message: 'Driver updated successfully',
          severity: 'success'
        });
      } else {
        // Add new driver
        const newDriver: Driver = {
          id: Date.now().toString(),
          ...formData,
          workingHours: 0,
          vacationDays: 0,
          assistants: [],
          salaryPayments: []
        };
        setDrivers([...drivers, newDriver]);
        setSnackbar({
          open: true,
          message: 'Driver added successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving driver',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (driverId: string) => {
    try {
      setDrivers(drivers.filter(d => d.id !== driverId));
      setSnackbar({
        open: true,
        message: 'Driver deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting driver',
        severity: 'error'
      });
    }
  };

  const handleAddAssistant = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    setSelectedDriver(driver || null);
    setAssistantFormData({
      firstName: '',
      lastName: '',
      phone: '',
      salary: 0,
      status: 'active'
    });
    setOpenAssistantDialog(true);
  };

  const handleAssistantSubmit = async () => {
    if (!selectedDriver) return;

    try {
      const newAssistant: Assistant = {
        id: Date.now().toString(),
        ...assistantFormData,
        workingHours: 0
      };

      const updatedDriver = {
        ...selectedDriver,
        assistants: [...selectedDriver.assistants, newAssistant]
      };

      setDrivers(drivers.map(d => d.id === selectedDriver.id ? updatedDriver : d));
      setSnackbar({
        open: true,
        message: 'Assistant added successfully',
        severity: 'success'
      });
      setOpenAssistantDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error adding assistant',
        severity: 'error'
      });
    }
  };

  const handleSalaryPayment = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    setSelectedDriver(driver || null);
    setSalaryFormData({
      amount: driver?.salary || 0,
      type: 'full',
      description: 'Monthly salary payment'
    });
    setOpenSalaryDialog(true);
  };

  const handleSalarySubmit = async () => {
    if (!selectedDriver) return;

    try {
      const newPayment: SalaryPayment = {
        id: Date.now().toString(),
        amount: salaryFormData.amount,
        date: new Date().toISOString().split('T')[0],
        type: salaryFormData.type,
        description: salaryFormData.description
      };

      const updatedDriver = {
        ...selectedDriver,
        salaryPayments: [...selectedDriver.salaryPayments, newPayment]
      };

      setDrivers(drivers.map(d => d.id === selectedDriver.id ? updatedDriver : d));
      setSnackbar({
        open: true,
        message: 'Salary payment recorded successfully',
        severity: 'success'
      });
      setOpenSalaryDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error recording salary payment',
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
          <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            {t('drivers.title')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadDrivers}
          >
            {t('common.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('drivers.addDriver')}
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Drivers
              </Typography>
              <Typography variant="h4">
                {drivers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Drivers
              </Typography>
              <Typography variant="h4">
                {drivers.filter(d => d.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Assistants
              </Typography>
              <Typography variant="h4">
                {drivers.reduce((sum, d) => sum + d.assistants.length, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Salary
              </Typography>
              <Typography variant="h4">
                {formatCurrency(drivers.reduce((sum, d) => sum + d.salary, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Drivers Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Driver</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>License</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned Machine</TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>Working Hours</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {driver.firstName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {driver.firstName} {driver.lastName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {driver.experience} years experience
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <PhoneIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          {driver.phone}
                        </Typography>
                        <Typography variant="body2">
                          <EmailIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          {driver.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={driver.licenseNumber}
                        size="small"
                        variant="outlined"
                        icon={<BadgeIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusOptions.find(s => s.value === driver.status)?.label}
                        color={getStatusColor(driver.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {driver.assignedMachine || '-'}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(driver.salary)}
                    </TableCell>
                    <TableCell>
                      {driver.workingHours.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Driver">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(driver)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Add Assistant">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleAddAssistant(driver.id)}
                          >
                            <PersonAddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Salary Payment">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleSalaryPayment(driver.id)}
                          >
                            <PaymentIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Driver">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(driver.id)}
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

      {/* Add/Edit Driver Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDriver ? t('drivers.editDriver') : t('drivers.addDriver')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="License Number"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Experience (years)"
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Salary ($)"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                required
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDriver ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Assistant Dialog */}
      <Dialog open={openAssistantDialog} onClose={() => setOpenAssistantDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Assistant</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={assistantFormData.firstName}
                onChange={(e) => setAssistantFormData({ ...assistantFormData, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={assistantFormData.lastName}
                onChange={(e) => setAssistantFormData({ ...assistantFormData, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={assistantFormData.phone}
                onChange={(e) => setAssistantFormData({ ...assistantFormData, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Salary ($)"
                type="number"
                value={assistantFormData.salary}
                onChange={(e) => setAssistantFormData({ ...assistantFormData, salary: parseFloat(e.target.value) })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssistantDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleAssistantSubmit} variant="contained">
            {t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Salary Payment Dialog */}
      <Dialog open={openSalaryDialog} onClose={() => setOpenSalaryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Salary Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount ($)"
                type="number"
                value={salaryFormData.amount}
                onChange={(e) => setSalaryFormData({ ...salaryFormData, amount: parseFloat(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={salaryFormData.type}
                  onChange={(e) => setSalaryFormData({ ...salaryFormData, type: e.target.value as any })}
                  label="Payment Type"
                >
                  <MenuItem value="full">Full Payment</MenuItem>
                  <MenuItem value="partial">Partial Payment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={salaryFormData.description}
                onChange={(e) => setSalaryFormData({ ...salaryFormData, description: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSalaryDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSalarySubmit} variant="contained">
            Record Payment
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

export default DriverManagement;