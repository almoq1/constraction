import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
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
  Divider,
  Badge,
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon,
  MarkEmailRead as MarkEmailReadIcon,
  MarkEmailUnread as MarkEmailUnreadIcon,
  FilterList as FilterIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  type: 'rent_due' | 'maintenance' | 'contract_deadline' | 'payment_overdue' | 'machine_maintenance' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  createdAt: string;
  dueDate?: string;
  assignedTo?: string;
  relatedEntity?: {
    type: 'rental' | 'contract' | 'machine' | 'driver';
    id: string;
    name: string;
  };
  actions?: AlertAction[];
  isRead: boolean;
}

interface AlertAction {
  id: string;
  label: string;
  action: string;
  url?: string;
}

const AlertsManagement: React.FC = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertItem | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general' as 'rent_due' | 'maintenance' | 'contract_deadline' | 'payment_overdue' | 'machine_maintenance' | 'general',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    dueDate: '',
    assignedTo: ''
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoResolve: false,
    reminderInterval: 'daily'
  });

  const typeOptions = [
    { value: 'rent_due', label: 'Rent Due', icon: <PaymentIcon />, color: 'warning' },
    { value: 'maintenance', label: 'Maintenance', icon: <BuildIcon />, color: 'info' },
    { value: 'contract_deadline', label: 'Contract Deadline', icon: <BusinessIcon />, color: 'error' },
    { value: 'payment_overdue', label: 'Payment Overdue', icon: <PaymentIcon />, color: 'error' },
    { value: 'machine_maintenance', label: 'Machine Maintenance', icon: <BuildIcon />, color: 'warning' },
    { value: 'general', label: 'General', icon: <InfoIcon />, color: 'default' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'success' },
    { value: 'medium', label: 'Medium', color: 'warning' },
    { value: 'high', label: 'High', color: 'error' },
    { value: 'critical', label: 'Critical', color: 'error' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'warning' },
    { value: 'acknowledged', label: 'Acknowledged', color: 'info' },
    { value: 'resolved', label: 'Resolved', color: 'success' },
    { value: 'dismissed', label: 'Dismissed', color: 'default' }
  ];

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockAlerts: AlertItem[] = [
        {
          id: '1',
          title: 'Rent Payment Due',
          message: 'Rent payment of $5,000 is due for Commercial Land Plot A on March 1, 2024',
          type: 'rent_due',
          priority: 'high',
          status: 'active',
          createdAt: '2024-02-25T10:00:00Z',
          dueDate: '2024-03-01',
          assignedTo: 'John Smith',
          relatedEntity: {
            type: 'rental',
            id: '1',
            name: 'Commercial Land Plot A'
          },
          actions: [
            { id: '1', label: 'View Rental', action: 'view', url: '/rentals/1' },
            { id: '2', label: 'Record Payment', action: 'payment', url: '/payments/new' }
          ],
          isRead: false
        },
        {
          id: '2',
          title: 'Machine Maintenance Required',
          message: 'Excavator-001 requires scheduled maintenance. Last service was 3 months ago.',
          type: 'machine_maintenance',
          priority: 'medium',
          status: 'acknowledged',
          createdAt: '2024-02-24T14:30:00Z',
          dueDate: '2024-03-15',
          assignedTo: 'Maintenance Team',
          relatedEntity: {
            type: 'machine',
            id: '1',
            name: 'Excavator-001'
          },
          actions: [
            { id: '1', label: 'View Machine', action: 'view', url: '/machines/1' },
            { id: '2', label: 'Schedule Maintenance', action: 'schedule', url: '/maintenance/schedule' }
          ],
          isRead: true
        },
        {
          id: '3',
          title: 'Contract Deadline Approaching',
          message: 'Highway construction project contract ends on March 31, 2024. 80% completion achieved.',
          type: 'contract_deadline',
          priority: 'critical',
          status: 'active',
          createdAt: '2024-02-23T09:15:00Z',
          dueDate: '2024-03-31',
          assignedTo: 'Project Manager',
          relatedEntity: {
            type: 'contract',
            id: '1',
            name: 'Highway Construction Project'
          },
          actions: [
            { id: '1', label: 'View Contract', action: 'view', url: '/contracts/1' },
            { id: '2', label: 'Update Progress', action: 'update', url: '/contracts/1/progress' }
          ],
          isRead: false
        },
        {
          id: '4',
          title: 'Payment Overdue',
          message: 'Utility payment of $500 is overdue by 5 days for office premises.',
          type: 'payment_overdue',
          priority: 'high',
          status: 'active',
          createdAt: '2024-02-20T16:45:00Z',
          dueDate: '2024-02-15',
          assignedTo: 'Finance Team',
          actions: [
            { id: '1', label: 'Record Payment', action: 'payment', url: '/payments/new' },
            { id: '2', label: 'Contact Provider', action: 'contact', url: '/contacts' }
          ],
          isRead: false
        },
        {
          id: '5',
          title: 'Driver License Expiring',
          message: 'Driver John Doe\'s license expires on April 15, 2024. Please ensure renewal.',
          type: 'maintenance',
          priority: 'medium',
          status: 'resolved',
          createdAt: '2024-02-19T11:20:00Z',
          dueDate: '2024-04-15',
          assignedTo: 'HR Team',
          relatedEntity: {
            type: 'driver',
            id: '1',
            name: 'John Doe'
          },
          actions: [
            { id: '1', label: 'View Driver', action: 'view', url: '/drivers/1' },
            { id: '2', label: 'Update License', action: 'update', url: '/drivers/1/license' }
          ],
          isRead: true
        }
      ];
      
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
      setSnackbar({
        open: true,
        message: 'Error loading alerts',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (alert?: AlertItem) => {
    if (alert) {
      setEditingAlert(alert);
      setFormData({
        title: alert.title,
        message: alert.message,
        type: alert.type,
        priority: alert.priority,
        dueDate: alert.dueDate || '',
        assignedTo: alert.assignedTo || ''
      });
    } else {
      setEditingAlert(null);
      setFormData({
        title: '',
        message: '',
        type: 'general',
        priority: 'medium',
        dueDate: '',
        assignedTo: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAlert(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingAlert) {
        // Update existing alert
        const updatedAlert = { ...editingAlert, ...formData };
        setAlerts(alerts.map(a => a.id === editingAlert.id ? updatedAlert : a));
        setSnackbar({
          open: true,
          message: 'Alert updated successfully',
          severity: 'success'
        });
      } else {
        // Add new alert
        const newAlert: AlertItem = {
          id: Date.now().toString(),
          ...formData,
          status: 'active',
          createdAt: new Date().toISOString(),
          isRead: false
        };
        setAlerts([newAlert, ...alerts]);
        setSnackbar({
          open: true,
          message: 'Alert created successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving alert',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (alertId: string) => {
    try {
      setAlerts(alerts.filter(a => a.id !== alertId));
      setSnackbar({
        open: true,
        message: 'Alert deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting alert',
        severity: 'error'
      });
    }
  };

  const handleStatusChange = async (alertId: string, newStatus: string) => {
    try {
      setAlerts(alerts.map(a => 
        a.id === alertId 
          ? { ...a, status: newStatus as any, isRead: true }
          : a
      ));
      setSnackbar({
        open: true,
        message: 'Alert status updated successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating alert status',
        severity: 'error'
      });
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      setAlerts(alerts.map(a => 
        a.id === alertId 
          ? { ...a, isRead: true }
          : a
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const typeOption = typeOptions.find(t => t.value === type);
    return typeOption?.icon || <InfoIcon />;
  };

  const getTypeColor = (type: string) => {
    const typeOption = typeOptions.find(t => t.value === type);
    return typeOption?.color || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const priorityOption = priorityOptions.find(p => p.value === priority);
    return priorityOption?.color || 'default';
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || 'default';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getUnreadCount = () => {
    return alerts.filter(a => !a.isRead).length;
  };

  const getActiveCount = () => {
    return alerts.filter(a => a.status === 'active').length;
  };

  const getCriticalCount = () => {
    return alerts.filter(a => a.priority === 'critical' && a.status === 'active').length;
  };

  const filteredAlerts = activeTab === 0 
    ? alerts.filter(a => a.status === 'active')
    : activeTab === 1
    ? alerts.filter(a => a.status === 'acknowledged')
    : alerts.filter(a => a.status === 'resolved');

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
          <Badge badgeContent={getUnreadCount()} color="error">
            <NotificationsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          </Badge>
          <Typography variant="h4" component="h1">
            {t('alerts.title')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setOpenSettingsDialog(true)}
          >
            Settings
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadAlerts}
          >
            {t('common.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('alerts.createAlert')}
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WarningIcon color="warning" />
                <Typography color="textSecondary">
                  Active Alerts
                </Typography>
              </Box>
              <Typography variant="h4">
                {getActiveCount()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ErrorIcon color="error" />
                <Typography color="textSecondary">
                  Critical Alerts
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {getCriticalCount()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MarkEmailUnreadIcon color="info" />
                <Typography color="textSecondary">
                  Unread Alerts
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {getUnreadCount()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircleIcon color="success" />
                <Typography color="textSecondary">
                  Resolved Today
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {alerts.filter(a => 
                  a.status === 'resolved' && 
                  new Date(a.createdAt).toDateString() === new Date().toDateString()
                ).length}
              </Typography>
            </CardContent>
          </Card>
      </Grid>

      {/* Tabs for Alert Status */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon />
                Active ({alerts.filter(a => a.status === 'active').length})
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon />
                Acknowledged ({alerts.filter(a => a.status === 'acknowledged').length})
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon />
                Resolved ({alerts.filter(a => a.status === 'resolved').length})
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {/* Alerts List */}
      <Card>
        <CardContent>
          <List>
            {filteredAlerts.map((alert, index) => (
              <React.Fragment key={alert.id}>
                <ListItem
                  sx={{
                    backgroundColor: alert.isRead ? 'transparent' : 'action.hover',
                    borderLeft: `4px solid ${
                      alert.priority === 'critical' ? '#f44336' :
                      alert.priority === 'high' ? '#ff9800' :
                      alert.priority === 'medium' ? '#2196f3' : '#4caf50'
                    }`
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${getTypeColor(alert.type)}.main` }}>
                      {getTypeIcon(alert.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {alert.title}
                        </Typography>
                        <Chip
                          label={priorityOptions.find(p => p.value === alert.priority)?.label}
                          color={getPriorityColor(alert.priority) as any}
                          size="small"
                        />
                        <Chip
                          label={statusOptions.find(s => s.value === alert.status)?.label}
                          color={getStatusColor(alert.status) as any}
                          size="small"
                        />
                        {!alert.isRead && (
                          <Chip label="New" color="error" size="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {alert.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Typography variant="caption" color="textSecondary">
                            Created: {formatDateTime(alert.createdAt)}
                          </Typography>
                          {alert.dueDate && (
                            <Typography variant="caption" color="textSecondary">
                              Due: {formatDate(alert.dueDate)}
                            </Typography>
                          )}
                          {alert.assignedTo && (
                            <Typography variant="caption" color="textSecondary">
                              Assigned to: {alert.assignedTo}
                            </Typography>
                          )}
                          {alert.relatedEntity && (
                            <Typography variant="caption" color="primary">
                              Related: {alert.relatedEntity.name}
                            </Typography>
                          )}
                        </Box>
                        {alert.actions && alert.actions.length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            {alert.actions.map((action) => (
                              <Button
                                key={action.id}
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  // Handle action navigation
                                  console.log('Action clicked:', action);
                                }}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </Stack>
                        )}
                      </Box>
                    }
                  />
                  <Stack direction="row" spacing={1}>
                    {!alert.isRead && (
                      <Tooltip title="Mark as Read">
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(alert.id)}
                        >
                          <MarkEmailReadIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit Alert">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(alert)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Alert">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(alert.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </ListItem>
                {index < filteredAlerts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          {filteredAlerts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No alerts found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Alert Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAlert ? t('alerts.editAlert') : t('alerts.createAlert')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
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
                label="Message"
                multiline
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
                  {typeOptions.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  label="Priority"
                >
                  {priorityOptions.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              <TextField
                fullWidth
                label="Assigned To"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAlert ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={openSettingsDialog} onClose={() => setOpenSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Alert Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smsNotifications}
                    onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                  />
                }
                label="SMS Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoResolve}
                    onChange={(e) => setSettings({ ...settings, autoResolve: e.target.checked })}
                  />
                }
                label="Auto-resolve after acknowledgment"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Reminder Interval</InputLabel>
                <Select
                  value={settings.reminderInterval}
                  onChange={(e) => setSettings({ ...settings, reminderInterval: e.target.value })}
                  label="Reminder Interval"
                >
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettingsDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={() => setOpenSettingsDialog(false)} variant="contained">
            Save Settings
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

export default AlertsManagement;