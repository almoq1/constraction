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
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  Apartment as ApartmentIcon,
  Landscape as LandscapeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Rental {
  id: string;
  rentalNumber: string;
  type: 'land' | 'room';
  title: string;
  description: string;
  location: string;
  size: number;
  unit: string;
  monthlyRent: number;
  status: 'available' | 'rented' | 'maintenance' | 'reserved';
  tenant?: Tenant;
  startDate?: string;
  endDate?: string;
  payments: RentalPayment[];
  totalCollected: number;
  outstandingAmount: number;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  idNumber: string;
  emergencyContact: string;
}

interface RentalPayment {
  id: string;
  amount: number;
  date: string;
  type: 'rent' | 'deposit' | 'utility' | 'other';
  description: string;
  status: 'paid' | 'pending' | 'overdue';
}

const RentalManagement: React.FC = () => {
  const { t } = useTranslation();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openTenantDialog, setOpenTenantDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const [formData, setFormData] = useState({
    rentalNumber: '',
    type: 'land' as 'land' | 'room',
    title: '',
    description: '',
    location: '',
    size: 0,
    unit: 'sqft',
    monthlyRent: 0,
    status: 'available' as const
  });

  const [tenantFormData, setTenantFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    idNumber: '',
    emergencyContact: ''
  });

  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0,
    type: 'rent' as 'rent' | 'deposit' | 'utility' | 'other',
    description: ''
  });

  const statusOptions = [
    { value: 'available', label: t('rentals.available'), color: 'success' },
    { value: 'rented', label: t('rentals.rented'), color: 'primary' },
    { value: 'maintenance', label: t('rentals.maintenance'), color: 'warning' },
    { value: 'reserved', label: t('rentals.reserved'), color: 'info' }
  ];

  const unitOptions = [
    { value: 'sqft', label: 'Square Feet' },
    { value: 'sqm', label: 'Square Meters' },
    { value: 'acres', label: 'Acres' },
    { value: 'hectares', label: 'Hectares' }
  ];

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockRentals: Rental[] = [
        {
          id: '1',
          rentalNumber: 'RENT-2024-001',
          type: 'land',
          title: 'Commercial Land Plot A',
          description: 'Prime commercial land in downtown area',
          location: 'Downtown Business District',
          size: 5000,
          unit: 'sqft',
          monthlyRent: 5000,
          status: 'rented',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          totalCollected: 15000,
          outstandingAmount: 5000,
          tenant: {
            id: '1',
            firstName: 'John',
            lastName: 'Smith',
            phone: '+1 (555) 123-4567',
            email: 'john.smith@example.com',
            idNumber: 'ID-123456',
            emergencyContact: '+1 (555) 987-6543'
          },
          payments: [
            {
              id: '1',
              amount: 5000,
              date: '2024-01-01',
              type: 'deposit',
              description: 'Security deposit',
              status: 'paid'
            },
            {
              id: '2',
              amount: 5000,
              date: '2024-01-01',
              type: 'rent',
              description: 'January rent',
              status: 'paid'
            },
            {
              id: '3',
              amount: 5000,
              date: '2024-02-01',
              type: 'rent',
              description: 'February rent',
              status: 'paid'
            },
            {
              id: '4',
              amount: 5000,
              date: '2024-03-01',
              type: 'rent',
              description: 'March rent',
              status: 'overdue'
            }
          ]
        },
        {
          id: '2',
          rentalNumber: 'RENT-2024-002',
          type: 'room',
          title: 'Office Room 101',
          description: 'Modern office space with amenities',
          location: 'Business Center, Floor 1',
          size: 800,
          unit: 'sqft',
          monthlyRent: 2000,
          status: 'available',
          totalCollected: 0,
          outstandingAmount: 0,
          payments: []
        },
        {
          id: '3',
          rentalNumber: 'RENT-2024-003',
          type: 'land',
          title: 'Industrial Land Plot B',
          description: 'Large industrial land for manufacturing',
          location: 'Industrial Zone',
          size: 10,
          unit: 'acres',
          monthlyRent: 8000,
          status: 'maintenance',
          totalCollected: 0,
          outstandingAmount: 0,
          payments: []
        }
      ];
      
      setRentals(mockRentals);
    } catch (error) {
      console.error('Error loading rentals:', error);
      setSnackbar({
        open: true,
        message: 'Error loading rentals',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (rental?: Rental) => {
    if (rental) {
      setEditingRental(rental);
      setFormData({
        rentalNumber: rental.rentalNumber,
        type: rental.type,
        title: rental.title,
        description: rental.description,
        location: rental.location,
        size: rental.size,
        unit: rental.unit,
        monthlyRent: rental.monthlyRent,
        status: rental.status
      });
    } else {
      setEditingRental(null);
      setFormData({
        rentalNumber: '',
        type: 'land',
        title: '',
        description: '',
        location: '',
        size: 0,
        unit: 'sqft',
        monthlyRent: 0,
        status: 'available'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRental(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingRental) {
        // Update existing rental
        const updatedRental = { ...editingRental, ...formData };
        setRentals(rentals.map(r => r.id === editingRental.id ? updatedRental : r));
        setSnackbar({
          open: true,
          message: 'Rental updated successfully',
          severity: 'success'
        });
      } else {
        // Add new rental
        const newRental: Rental = {
          id: Date.now().toString(),
          ...formData,
          totalCollected: 0,
          outstandingAmount: 0,
          payments: []
        };
        setRentals([...rentals, newRental]);
        setSnackbar({
          open: true,
          message: 'Rental added successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving rental',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (rentalId: string) => {
    try {
      setRentals(rentals.filter(r => r.id !== rentalId));
      setSnackbar({
        open: true,
        message: 'Rental deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting rental',
        severity: 'error'
      });
    }
  };

  const handleAssignTenant = (rentalId: string) => {
    const rental = rentals.find(r => r.id === rentalId);
    setSelectedRental(rental || null);
    setTenantFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      idNumber: '',
      emergencyContact: ''
    });
    setOpenTenantDialog(true);
  };

  const handleTenantSubmit = async () => {
    if (!selectedRental) return;

    try {
      const newTenant: Tenant = {
        id: Date.now().toString(),
        ...tenantFormData
      };

      const updatedRental = {
        ...selectedRental,
        tenant: newTenant,
        status: 'rented' as const,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      setRentals(rentals.map(r => r.id === selectedRental.id ? updatedRental : r));
      setSnackbar({
        open: true,
        message: 'Tenant assigned successfully',
        severity: 'success'
      });
      setOpenTenantDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error assigning tenant',
        severity: 'error'
      });
    }
  };

  const handleAddPayment = (rentalId: string) => {
    const rental = rentals.find(r => r.id === rentalId);
    setSelectedRental(rental || null);
    setPaymentFormData({
      amount: rental?.monthlyRent || 0,
      type: 'rent',
      description: 'Monthly rent payment'
    });
    setOpenPaymentDialog(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedRental) return;

    try {
      const newPayment: RentalPayment = {
        id: Date.now().toString(),
        amount: paymentFormData.amount,
        date: new Date().toISOString().split('T')[0],
        type: paymentFormData.type,
        description: paymentFormData.description,
        status: 'paid'
      };

      const updatedRental = {
        ...selectedRental,
        payments: [...selectedRental.payments, newPayment],
        totalCollected: selectedRental.totalCollected + paymentFormData.amount,
        outstandingAmount: Math.max(0, selectedRental.outstandingAmount - paymentFormData.amount)
      };

      setRentals(rentals.map(r => r.id === selectedRental.id ? updatedRental : r));
      setSnackbar({
        open: true,
        message: 'Payment recorded successfully',
        severity: 'success'
      });
      setOpenPaymentDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error recording payment',
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

  const getRentalIcon = (type: string) => {
    return type === 'land' ? <LandscapeIcon /> : <ApartmentIcon />;
  };

  const filteredRentals = activeTab === 0 
    ? rentals.filter(r => r.type === 'land')
    : rentals.filter(r => r.type === 'room');

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
          <HomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            {t('rentals.title')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadRentals}
          >
            {t('common.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('rentals.addRental')}
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Rentals
              </Typography>
              <Typography variant="h4">
                {rentals.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Rented Units
              </Typography>
              <Typography variant="h4">
                {rentals.filter(r => r.status === 'rented').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Monthly Revenue
              </Typography>
              <Typography variant="h4">
                {formatCurrency(rentals.filter(r => r.status === 'rented').reduce((sum, r) => sum + r.monthlyRent, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Outstanding Amount
              </Typography>
              <Typography variant="h4" color="error.main">
                {formatCurrency(rentals.reduce((sum, r) => sum + r.outstandingAmount, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for Land and Room Rentals */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LandscapeIcon />
                Land Rentals ({rentals.filter(r => r.type === 'land').length})
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ApartmentIcon />
                Room Rentals ({rentals.filter(r => r.type === 'room').length})
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {/* Rentals Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rental</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Monthly Rent</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Payments</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getRentalIcon(rental.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {rental.rentalNumber}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {rental.title}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          {rental.location}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {rental.size.toLocaleString()} {rental.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusOptions.find(s => s.value === rental.status)?.label}
                        color={getStatusColor(rental.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(rental.monthlyRent)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {rental.tenant ? (
                        <Box>
                          <Typography variant="body2">
                            {rental.tenant.firstName} {rental.tenant.lastName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {rental.tenant.phone}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No tenant
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" color="success.main">
                          {formatCurrency(rental.totalCollected)}
                        </Typography>
                        {rental.outstandingAmount > 0 && (
                          <Typography variant="caption" color="error.main">
                            {formatCurrency(rental.outstandingAmount)} overdue
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Rental">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(rental)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {!rental.tenant && (
                          <Tooltip title="Assign Tenant">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleAssignTenant(rental.id)}
                            >
                              <PersonIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {rental.tenant && (
                          <Tooltip title="Add Payment">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleAddPayment(rental.id)}
                            >
                              <PaymentIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete Rental">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(rental.id)}
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

      {/* Add/Edit Rental Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRental ? t('rentals.editRental') : t('rentals.addRental')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rental Number"
                value={formData.rentalNumber}
                onChange={(e) => setFormData({ ...formData, rentalNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  label="Type"
                >
                  <MenuItem value="land">Land</MenuItem>
                  <MenuItem value="room">Room</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Size"
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: parseFloat(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  label="Unit"
                >
                  {unitOptions.map((unit) => (
                    <MenuItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Rent ($)"
                type="number"
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: parseFloat(e.target.value) })}
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
            {editingRental ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Tenant Dialog */}
      <Dialog open={openTenantDialog} onClose={() => setOpenTenantDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Assign Tenant</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={tenantFormData.firstName}
                onChange={(e) => setTenantFormData({ ...tenantFormData, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={tenantFormData.lastName}
                onChange={(e) => setTenantFormData({ ...tenantFormData, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={tenantFormData.phone}
                onChange={(e) => setTenantFormData({ ...tenantFormData, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={tenantFormData.email}
                onChange={(e) => setTenantFormData({ ...tenantFormData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID Number"
                value={tenantFormData.idNumber}
                onChange={(e) => setTenantFormData({ ...tenantFormData, idNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact"
                value={tenantFormData.emergencyContact}
                onChange={(e) => setTenantFormData({ ...tenantFormData, emergencyContact: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTenantDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleTenantSubmit} variant="contained">
            Assign Tenant
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount ($)"
                type="number"
                value={paymentFormData.amount}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: parseFloat(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={paymentFormData.type}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, type: e.target.value as any })}
                  label="Payment Type"
                >
                  <MenuItem value="rent">Rent</MenuItem>
                  <MenuItem value="deposit">Deposit</MenuItem>
                  <MenuItem value="utility">Utility</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={paymentFormData.description}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, description: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handlePaymentSubmit} variant="contained">
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

export default RentalManagement;