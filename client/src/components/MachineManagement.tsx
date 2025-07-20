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
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Construction as ConstructionIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Machine {
  id: string;
  name: string;
  type: string;
  model: string;
  year: number;
  capacity: string;
  hourlyRate: number;
  status: 'active' | 'inactive' | 'maintenance' | 'rented';
  location: string;
  assignedDriver?: string;
  workingHours: number;
  lastMaintenance: string;
}

const MachineManagement: React.FC = () => {
  const { t } = useTranslation();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    model: '',
    year: new Date().getFullYear(),
    capacity: '',
    hourlyRate: 0,
    status: 'active',
    location: ''
  });

  const machineTypes = [
    'excavator',
    'bulldozer',
    'crane',
    'loader',
    'dump_truck',
    'concrete_mixer',
    'roller',
    'other'
  ];

  const statusOptions = [
    { value: 'active', label: t('machines.active'), color: 'success' },
    { value: 'inactive', label: t('machines.inactive'), color: 'default' },
    { value: 'maintenance', label: t('machines.maintenance'), color: 'warning' },
    { value: 'rented', label: t('machines.rented'), color: 'info' }
  ];

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockMachines: Machine[] = [
        {
          id: '1',
          name: 'Excavator-001',
          type: 'excavator',
          model: 'CAT 320',
          year: 2020,
          capacity: '20 tons',
          hourlyRate: 150,
          status: 'active',
          location: 'Site A',
          assignedDriver: 'John Doe',
          workingHours: 1200,
          lastMaintenance: '2024-01-10'
        },
        {
          id: '2',
          name: 'Bulldozer-001',
          type: 'bulldozer',
          model: 'CAT D6',
          year: 2019,
          capacity: '15 tons',
          hourlyRate: 120,
          status: 'maintenance',
          location: 'Site B',
          workingHours: 800,
          lastMaintenance: '2024-01-15'
        },
        {
          id: '3',
          name: 'Crane-001',
          type: 'crane',
          model: 'Liebherr LTM',
          year: 2021,
          capacity: '50 tons',
          hourlyRate: 200,
          status: 'rented',
          location: 'Site C',
          assignedDriver: 'Jane Smith',
          workingHours: 600,
          lastMaintenance: '2024-01-05'
        }
      ];
      
      setMachines(mockMachines);
    } catch (error) {
      console.error('Error loading machines:', error);
      setSnackbar({
        open: true,
        message: 'Error loading machines',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (machine?: Machine) => {
    if (machine) {
      setEditingMachine(machine);
      setFormData({
        name: machine.name,
        type: machine.type,
        model: machine.model,
        year: machine.year,
        capacity: machine.capacity,
        hourlyRate: machine.hourlyRate,
        status: machine.status,
        location: machine.location
      });
    } else {
      setEditingMachine(null);
      setFormData({
        name: '',
        type: '',
        model: '',
        year: new Date().getFullYear(),
        capacity: '',
        hourlyRate: 0,
        status: 'active',
        location: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMachine(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingMachine) {
        // Update existing machine
        const updatedMachine = { ...editingMachine, ...formData };
        setMachines(machines.map(m => m.id === editingMachine.id ? updatedMachine : m));
        setSnackbar({
          open: true,
          message: 'Machine updated successfully',
          severity: 'success'
        });
      } else {
        // Add new machine
        const newMachine: Machine = {
          id: Date.now().toString(),
          ...formData,
          workingHours: 0,
          lastMaintenance: new Date().toISOString().split('T')[0]
        };
        setMachines([...machines, newMachine]);
        setSnackbar({
          open: true,
          message: 'Machine added successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving machine',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (machineId: string) => {
    try {
      setMachines(machines.filter(m => m.id !== machineId));
      setSnackbar({
        open: true,
        message: 'Machine deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting machine',
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
          <ConstructionIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            {t('machines.title')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadMachines}
          >
            {t('common.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('machines.addMachine')}
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Machines
              </Typography>
              <Typography variant="h4">
                {machines.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Machines
              </Typography>
              <Typography variant="h4">
                {machines.filter(m => m.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Maintenance
              </Typography>
              <Typography variant="h4">
                {machines.filter(m => m.status === 'maintenance').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Value
              </Typography>
              <Typography variant="h4">
                {formatCurrency(machines.reduce((sum, m) => sum + m.hourlyRate * 100, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Machines Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Hourly Rate</TableCell>
                  <TableCell>Working Hours</TableCell>
                  <TableCell>Assigned Driver</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {machines.map((machine) => (
                  <TableRow key={machine.id}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {machine.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {machine.year}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={machine.type}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{machine.model}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusOptions.find(s => s.value === machine.status)?.label}
                        color={getStatusColor(machine.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{machine.location}</TableCell>
                    <TableCell>{formatCurrency(machine.hourlyRate)}</TableCell>
                    <TableCell>{machine.workingHours.toLocaleString()}</TableCell>
                    <TableCell>
                      {machine.assignedDriver || '-'}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Machine">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(machine)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Machine">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(machine.id)}
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

      {/* Add/Edit Machine Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMachine ? t('machines.editMachine') : t('machines.addMachine')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Machine Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Type"
                >
                  {machineTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hourly Rate ($)"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
            {editingMachine ? t('common.save') : t('common.add')}
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

export default MachineManagement;