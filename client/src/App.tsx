import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppSelector, useAppDispatch } from './hooks/redux';
import { initializeApp } from './store/slices/authSlice';

// Components
import LandingPage from './components/LandingPage';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Machines from './pages/Machines/Machines';
import Drivers from './pages/Drivers/Drivers';
import Contracts from './pages/Contracts/Contracts';
import Rentals from './pages/Rentals/Rentals';
import Payments from './pages/Payments/Payments';
import Alerts from './pages/Alerts/Alerts';
import Profile from './pages/Profile/Profile';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SocketProvider from './components/Socket/SocketProvider';

// SaaS Platform Components
import SaasLanding from './pages/SaasLanding/SaasLanding';
import CompanySelect from './pages/CompanySelect/CompanySelect';
import CompanyLanding from './pages/CompanyLanding/CompanyLanding';

// Super Admin Components
import SuperAdminLogin from './pages/SuperAdmin/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard';

// User Account Components
import DriverLogin from './pages/DriverLogin/DriverLogin';
import DriverDashboard from './pages/DriverDashboard/DriverDashboard';
import AssistantLogin from './pages/AssistantLogin/AssistantLogin';
import AssistantDashboard from './pages/AssistantDashboard/AssistantDashboard';
import TenantLogin from './pages/TenantLogin/TenantLogin';
import TenantDashboard from './pages/TenantDashboard/TenantDashboard';
import MachineParkerLogin from './pages/MachineParkerLogin/MachineParkerLogin';
import MachineParkerDashboard from './pages/MachineParkerDashboard/MachineParkerDashboard';

// Loading component
const LoadingScreen = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress size={60} />
  </Box>
);

function App() {
  const dispatch = useAppDispatch();
  const { isInitialized, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeApp());
  }, [dispatch]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <SocketProvider>
      <Routes>
        {/* SaaS Platform Routes */}
        <Route path="/" element={<SaasLanding />} />
        <Route path="/company-select" element={<CompanySelect />} />
        <Route path="/company-landing" element={<CompanyLanding />} />
        
        {/* Super Admin Routes */}
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />
        <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
        
        {/* Legacy App Routes */}
        <Route
          path="/app"
          element={
            isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/app/register" replace /> : <Register />
          }
        />

        {/* User Account Routes */}
        <Route path="/driver-login" element={<DriverLogin />} />
        <Route path="/driver-dashboard" element={<DriverDashboard />} />
        <Route path="/assistant-login" element={<AssistantLogin />} />
        <Route path="/assistant-dashboard" element={<AssistantDashboard />} />
        <Route path="/tenant-login" element={<TenantLogin />} />
        <Route path="/tenant-dashboard" element={<TenantDashboard />} />
        <Route path="/machine-parker-login" element={<MachineParkerLogin />} />
        <Route path="/machine-parker-dashboard" element={<MachineParkerDashboard />} />

        {/* Protected routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="machines" element={<Machines />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="rentals" element={<Rentals />} />
          <Route path="payments" element={<Payments />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SocketProvider>
  );
}

export default App;