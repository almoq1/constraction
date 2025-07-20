import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: any): Promise<ApiResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData: any): Promise<ApiResponse> => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData: any): Promise<ApiResponse> => {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  },
};

// Machines API
export const machinesAPI = {
  getAll: async (): Promise<ApiResponse> => {
    const response = await api.get('/machines');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/machines/${id}`);
    return response.data;
  },

  create: async (machineData: any): Promise<ApiResponse> => {
    const response = await api.post('/machines', machineData);
    return response.data;
  },

  update: async (id: string, machineData: any): Promise<ApiResponse> => {
    const response = await api.put(`/machines/${id}`, machineData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/machines/${id}`);
    return response.data;
  },

  assign: async (id: string, assignmentData: any): Promise<ApiResponse> => {
    const response = await api.post(`/machines/${id}/assign`, assignmentData);
    return response.data;
  },

  getHours: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/machines/${id}/hours`);
    return response.data;
  },
};

// Drivers API
export const driversAPI = {
  getAll: async (): Promise<ApiResponse> => {
    const response = await api.get('/drivers');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  create: async (driverData: any): Promise<ApiResponse> => {
    const response = await api.post('/drivers', driverData);
    return response.data;
  },

  update: async (id: string, driverData: any): Promise<ApiResponse> => {
    const response = await api.put(`/drivers/${id}`, driverData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
  },

  getAssistants: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/drivers/${id}/assistants`);
    return response.data;
  },

  addAssistant: async (id: string, assistantData: any): Promise<ApiResponse> => {
    const response = await api.post(`/drivers/${id}/assistants`, assistantData);
    return response.data;
  },

  processSalary: async (id: string, salaryData: any): Promise<ApiResponse> => {
    const response = await api.post(`/drivers/${id}/salary`, salaryData);
    return response.data;
  },
};

// Contracts API
export const contractsAPI = {
  getAll: async (): Promise<ApiResponse> => {
    const response = await api.get('/contracts');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },

  create: async (contractData: any): Promise<ApiResponse> => {
    const response = await api.post('/contracts', contractData);
    return response.data;
  },

  update: async (id: string, contractData: any): Promise<ApiResponse> => {
    const response = await api.put(`/contracts/${id}`, contractData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/contracts/${id}`);
    return response.data;
  },

  assignMachines: async (id: string, machinesData: any): Promise<ApiResponse> => {
    const response = await api.post(`/contracts/${id}/machines`, machinesData);
    return response.data;
  },

  getSummary: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/contracts/${id}/summary`);
    return response.data;
  },
};

// Rentals API
export const rentalsAPI = {
  getLandRentals: async (): Promise<ApiResponse> => {
    const response = await api.get('/rentals/land');
    return response.data;
  },

  getRoomRentals: async (): Promise<ApiResponse> => {
    const response = await api.get('/rentals/rooms');
    return response.data;
  },

  createLandRental: async (rentalData: any): Promise<ApiResponse> => {
    const response = await api.post('/rentals/land', rentalData);
    return response.data;
  },

  createRoomRental: async (rentalData: any): Promise<ApiResponse> => {
    const response = await api.post('/rentals/rooms', rentalData);
    return response.data;
  },

  updateLandRental: async (id: string, rentalData: any): Promise<ApiResponse> => {
    const response = await api.put(`/rentals/land/${id}`, rentalData);
    return response.data;
  },

  updateRoomRental: async (id: string, rentalData: any): Promise<ApiResponse> => {
    const response = await api.put(`/rentals/rooms/${id}`, rentalData);
    return response.data;
  },

  deleteLandRental: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/rentals/land/${id}`);
    return response.data;
  },

  deleteRoomRental: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/rentals/rooms/${id}`);
    return response.data;
  },

  recordPayment: async (id: string, paymentData: any): Promise<ApiResponse> => {
    const response = await api.post(`/rentals/${id}/payments`, paymentData);
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async (): Promise<ApiResponse> => {
    const response = await api.get('/payments');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  create: async (paymentData: any): Promise<ApiResponse> => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  update: async (id: string, paymentData: any): Promise<ApiResponse> => {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },

  getSummary: async (): Promise<ApiResponse> => {
    const response = await api.get('/payments/summary');
    return response.data;
  },

  getStatistics: async (): Promise<ApiResponse> => {
    const response = await api.get('/payments/statistics');
    return response.data;
  },
};

// Alerts API
export const alertsAPI = {
  getAll: async (): Promise<ApiResponse> => {
    const response = await api.get('/alerts');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/alerts/${id}`);
    return response.data;
  },

  create: async (alertData: any): Promise<ApiResponse> => {
    const response = await api.post('/alerts', alertData);
    return response.data;
  },

  update: async (id: string, alertData: any): Promise<ApiResponse> => {
    const response = await api.put(`/alerts/${id}`, alertData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/alerts/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<ApiResponse> => {
    const response = await api.put(`/alerts/${id}/status`, { status });
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getOverview: async (): Promise<ApiResponse> => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },

  getStatistics: async (): Promise<ApiResponse> => {
    const response = await api.get('/dashboard/statistics');
    return response.data;
  },

  getTrends: async (): Promise<ApiResponse> => {
    const response = await api.get('/dashboard/trends');
    return response.data;
  },
};

// File upload API
export const uploadAPI = {
  uploadFile: async (file: File, type: string): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Accounts API
export const accountsAPI = {
  // Driver accounts
  createDriverAccount: async (accountData: any): Promise<ApiResponse> => {
    const response = await api.post('/accounts/driver', accountData);
    return response.data;
  },

  driverLogin: async (email: string, password: string): Promise<ApiResponse> => {
    const response = await api.post('/accounts/driver/login', { email, password });
    return response.data;
  },

  getDriverDashboard: async (): Promise<ApiResponse> => {
    const response = await api.get('/accounts/driver/dashboard');
    return response.data;
  },

  // Assistant accounts
  createAssistantAccount: async (accountData: any): Promise<ApiResponse> => {
    const response = await api.post('/accounts/assistant', accountData);
    return response.data;
  },

  assistantLogin: async (email: string, password: string): Promise<ApiResponse> => {
    const response = await api.post('/accounts/assistant/login', { email, password });
    return response.data;
  },

  getAssistantDashboard: async (): Promise<ApiResponse> => {
    const response = await api.get('/accounts/assistant/dashboard');
    return response.data;
  },

  // Tenant accounts
  createTenantAccount: async (accountData: any): Promise<ApiResponse> => {
    const response = await api.post('/accounts/tenant', accountData);
    return response.data;
  },

  tenantLogin: async (email: string, password: string): Promise<ApiResponse> => {
    const response = await api.post('/accounts/tenant/login', { email, password });
    return response.data;
  },

  getTenantDashboard: async (): Promise<ApiResponse> => {
    const response = await api.get('/accounts/tenant/dashboard');
    return response.data;
  },

  // Machine parker accounts
  createMachineParkerAccount: async (accountData: any): Promise<ApiResponse> => {
    const response = await api.post('/accounts/machine-parker', accountData);
    return response.data;
  },

  machineParkerLogin: async (email: string, password: string): Promise<ApiResponse> => {
    const response = await api.post('/accounts/machine-parker/login', { email, password });
    return response.data;
  },

  getMachineParkerDashboard: async (): Promise<ApiResponse> => {
    const response = await api.get('/accounts/machine-parker/dashboard');
    return response.data;
  },

  // Leave management
  requestLeave: async (leaveData: any): Promise<ApiResponse> => {
    const response = await api.post('/accounts/leave', leaveData);
    return response.data;
  },

  getLeaveHistory: async (): Promise<ApiResponse> => {
    const response = await api.get('/accounts/leave/history');
    return response.data;
  },
};

export default api;