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
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Construction as ConstructionIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Contract {
  id: string;
  contractNumber: string;
  clientName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  assignedMachines: ContractMachine[];
  workingHours: number;
  requiredHours: number;
  payments: ContractPayment[];
  progress: number;
  description: string;
}

interface ContractMachine {
  id: string;
  machineId: string;
  machineName: string;
  hourlyRate: number;
  assignedHours: number;
  workingHours: number;
}

interface ContractPayment {
  id: string;
  amount: number;
  date: string;
  type: 'advance' | 'progress' | 'final';
  description: string;
}

const ContractManagement: React.FC = () => {
  const { t } = useTranslation();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openMachineDialog, setOpenMachineDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const [formData, setFormData] = useState({
    contractNumber: '',
    clientName: '',
    startDate: '',
    endDate: '',
    totalAmount: 0,
    status: 'pending' as const,
    description: '',
    requiredHours: 0
  });

  const [machineFormData, setMachineFormData] = useState({
    machineId: '',
    hourlyRate: 0,
    assignedHours: 0
  });

  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0,
    type: 'progress' as 'advance' | 'progress' | 'final',
    description: ''
  });

  const statusOptions = [
    { value: 'pending', label: t('contracts.pending'), color: 'warning' },
    { value: 'active', label: t('contracts.active'), color: 'success' },
    { value: 'completed', label: t('contracts.completed'), color: 'info' },
    { value: 'cancelled', label: t('contracts.cancelled'), color: 'error' }
  ];

  const availableMachines = [
    { id: '1', name: 'Excavator-001', type: 'excavator', hourlyRate: 150 },
    { id: '2', name: 'Bulldozer-001', type: 'bulldozer', hourlyRate: 120 },
    { id: '3', name: 'Crane-001', type: 'crane', hourlyRate: 200 },
    { id: '4', name: 'Loader-001', type: 'loader', hourlyRate: 100 }
  ];

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockContracts: Contract[] = [
        {
          id: '1',
          contractNumber: 'CTR-2024-001',
          clientName: 'ABC Construction Co.',
          startDate: '2024-01-01',
          endDate: '2024-06-30',
          totalAmount: 150000,
          status: 'active',
          workingHours: 480,
          requiredHours: 600,
          progress: 80,
          description: 'Highway construction project',
          assignedMachines: [
            {
              id: '1',
              machineId: '1',
              machineName: 'Excavator-001',
              hourlyRate: 150,
              assignedHours: 200,
              workingHours: 160
            },
            {
              id: '2',
              machineId: '2',
              machineName: 'Bulldozer-001',
              hourlyRate: 120,
              assignedHours: 150,
              workingHours: 120
            }
          ],
          payments: [
            {
              id: '1',
              amount: 50000,
              date: '2024-01-01',
              type: 'advance',
              description: 'Advance payment'
            },
            {
              id: '2',
              amount: 30000,
              date: '2024-02-01',
              type: 'progress',
              description: 'Progress payment'
            }
          ]
        },
        {
          id: '2',
          contractNumber: 'CTR-2024-002',
          clientName: 'XYZ Development Ltd.',
          startDate: '2024-02-01',
          endDate: '2024-08-31',
          totalAmount: 200000,
          status: 'pending',
          workingHours: 0,
          requiredHours: 800,
          progress: 0,
          description: 'Commercial building foundation',
          assignedMachines: [],
          payments: []
        }
      ];
      
      setContracts(mockContracts);
    } catch (error) {
      console.error('Error loading contracts:', error);
      setSnackbar({
        open: true,
        message: 'Error loading contracts',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (contract?: Contract) => {
    if (contract) {
      setEditingContract(contract);
      setFormData({
        contractNumber: contract.contractNumber,
        clientName: contract.clientName,
        startDate: contract.startDate,
        endDate: contract.endDate,
        totalAmount: contract.totalAmount,
        status: contract.status,
        description: contract.description,
        requiredHours: contract.requiredHours
      });
    } else {
      setEditingContract(null);
      setFormData({
        contractNumber: '',
        clientName: '',
        startDate: '',
        endDate: '',
        totalAmount: 0,
        status: 'pending',
        description: '',
        requiredHours: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingContract(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingContract) {
        // Update existing contract
        const updatedContract = { ...editingContract, ...formData };
        setContracts(contracts.map(c => c.id === editingContract.id ? updatedContract : c));
        setSnackbar({
          open: true,
          message: 'Contract updated successfully',
          severity: 'success'
        });
      } else {
        // Add new contract
        const newContract: Contract = {
          id: Date.now().toString(),
          ...formData,
          workingHours: 0,
          progress: 0,
          assignedMachines: [],
          payments: []
        };
        setContracts([...contracts, newContract]);
        setSnackbar({
          open: true,
          message: 'Contract added successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving contract',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (contractId: string) => {
    try {
      setContracts(contracts.filter(c => c.id !== contractId));
      setSnackbar({
        open: true,
        message: 'Contract deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting contract',
        severity: 'error'
      });
    }
  };

  const handleAddMachine = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    setSelectedContract(contract || null);
    setMachineFormData({
      machineId: '',
      hourlyRate: 0,
      assignedHours: 0
    });
    setOpenMachineDialog(true);
  };

  const handleMachineSubmit = async () => {
    if (!selectedContract) return;

    try {
      const selectedMachine = availableMachines.find(m => m.id === machineFormData.machineId);
      if (!selectedMachine) return;

      const newMachine: ContractMachine = {
        id: Date.now().toString(),
        machineId: machineFormData.machineId,
        machineName: selectedMachine.name,
        hourlyRate: machineFormData.hourlyRate,
        assignedHours: machineFormData.assignedHours,
        workingHours: 0
      };

      const updatedContract = {
        ...selectedContract,
        assignedMachines: [...selectedContract.assignedMachines, newMachine]
      };

      setContracts(contracts.map(c => c.id === selectedContract.id ? updatedContract : c));
      setSnackbar({
        open: true,
        message: 'Machine assigned successfully',
        severity: 'success'
      });
      setOpenMachineDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error assigning machine',
        severity: 'error'
      });
    }
  };

  const handleAddPayment = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    setSelectedContract(contract || null);
    setPaymentFormData({
      amount: 0,
      type: 'progress',
      description: ''
    });
    setOpenPaymentDialog(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedContract) return;

    try {
      const newPayment: ContractPayment = {
        id: Date.now().toString(),
        amount: paymentFormData.amount,
        date: new Date().toISOString().split('T')[0],
        type: paymentFormData.type,
        description: paymentFormData.description
      };

      const updatedContract = {
        ...selectedContract,
        payments: [...selectedContract.payments, newPayment]
      };

      setContracts(contracts.map(c => c.id === selectedContract.id ? updatedContract : c));
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

  const calculateTotalPaid = (payments: ContractPayment[]) => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const calculateRemainingAmount = (contract: Contract) => {
    const totalPaid = calculateTotalPaid(contract.payments);
    return contract.totalAmount - totalPaid;
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
          <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            {t('contracts.title')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadContracts}
          >
            {t('common.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('contracts.addContract')}
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Contracts
              </Typography>
              <Typography variant="h4">
                {contracts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Contracts
              </Typography>
              <Typography variant="h4">
                {contracts.filter(c => c.status === 'active').length}
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
                {formatCurrency(contracts.reduce((sum, c) => sum + c.totalAmount, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Progress
              </Typography>
              <Typography variant="h4">
                {contracts.length > 0 
                  ? Math.round(contracts.reduce((sum, c) => sum + c.progress, 0) / contracts.length)
                  : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contracts Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contract</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Paid Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {contract.contractNumber}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {contract.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {contract.clientName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <CalendarIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          {formatDate(contract.startDate)}
                        </Typography>
                        <Typography variant="body2">
                          to {formatDate(contract.endDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusOptions.find(s => s.value === contract.status)?.label}
                        color={getStatusColor(contract.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            {contract.progress}%
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {contract.workingHours}/{contract.requiredHours}h
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={contract.progress}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(contract.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" color="success.main">
                          {formatCurrency(calculateTotalPaid(contract.payments))}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatCurrency(calculateRemainingAmount(contract))} remaining
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Contract">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(contract)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Assign Machine">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleAddMachine(contract.id)}
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Add Payment">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleAddPayment(contract.id)}
                          >
                            <PaymentIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Contract">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(contract.id)}
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

      {/* Add/Edit Contract Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingContract ? t('contracts.editContract') : t('contracts.addContract')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contract Number"
                value={formData.contractNumber}
                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client Name"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Amount ($)"
                type="number"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Required Hours"
                type="number"
                value={formData.requiredHours}
                onChange={(e) => setFormData({ ...formData, requiredHours: parseInt(e.target.value) })}
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
            {editingContract ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Machine Dialog */}
      <Dialog open={openMachineDialog} onClose={() => setOpenMachineDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Machine to Contract</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Machine</InputLabel>
                <Select
                  value={machineFormData.machineId}
                  onChange={(e) => {
                    const machine = availableMachines.find(m => m.id === e.target.value);
                    setMachineFormData({
                      ...machineFormData,
                      machineId: e.target.value,
                      hourlyRate: machine?.hourlyRate || 0
                    });
                  }}
                  label="Machine"
                >
                  {availableMachines.map((machine) => (
                    <MenuItem key={machine.id} value={machine.id}>
                      {machine.name} ({machine.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hourly Rate ($)"
                type="number"
                value={machineFormData.hourlyRate}
                onChange={(e) => setMachineFormData({ ...machineFormData, hourlyRate: parseFloat(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Assigned Hours"
                type="number"
                value={machineFormData.assignedHours}
                onChange={(e) => setMachineFormData({ ...machineFormData, assignedHours: parseInt(e.target.value) })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMachineDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleMachineSubmit} variant="contained">
            Assign Machine
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
                  <MenuItem value="advance">Advance Payment</MenuItem>
                  <MenuItem value="progress">Progress Payment</MenuItem>
                  <MenuItem value="final">Final Payment</MenuItem>
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

export default ContractManagement;