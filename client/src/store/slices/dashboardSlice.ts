import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface DashboardStats {
  totalMachines: number;
  activeContracts: number;
  totalDrivers: number;
  monthlyRevenue: number;
  machineUtilization: number;
  contractPerformance: number;
  recentPayments: Array<{
    id: string;
    amount: number;
    type: string;
    date: string;
    status: string;
  }>;
  upcomingAlerts: Array<{
    id: string;
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    dueDate: string;
    type: string;
  }>;
}

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null
};

// Async thunk for fetching dashboard data
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      // Here you would make an API call to fetch dashboard data
      // For now, returning mock data
      const response = await new Promise<DashboardStats>((resolve) => {
        setTimeout(() => {
          resolve({
            totalMachines: 25,
            activeContracts: 8,
            totalDrivers: 15,
            monthlyRevenue: 125000,
            machineUtilization: 78,
            contractPerformance: 85,
            recentPayments: [
              {
                id: '1',
                amount: 15000,
                type: 'contract',
                date: '2024-01-15',
                status: 'received'
              },
              {
                id: '2',
                amount: 8500,
                type: 'rent',
                date: '2024-01-14',
                status: 'received'
              },
              {
                id: '3',
                amount: 22000,
                type: 'contract',
                date: '2024-01-13',
                status: 'pending'
              }
            ],
            upcomingAlerts: [
              {
                id: '1',
                title: 'Rent Due',
                message: 'Land rental payment due in 3 days',
                priority: 'high',
                dueDate: '2024-01-18',
                type: 'rentDue'
              },
              {
                id: '2',
                title: 'Contract Expiry',
                message: 'Contract #CTR-2024-001 expires in 7 days',
                priority: 'medium',
                dueDate: '2024-01-22',
                type: 'contractExpiry'
              },
              {
                id: '3',
                title: 'Salary Due',
                message: 'Driver salary payment due in 5 days',
                priority: 'medium',
                dueDate: '2024-01-20',
                type: 'salaryDue'
              }
            ]
          });
        }, 1000);
      });

      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch dashboard data');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    updateStats: (state, action: PayloadAction<Partial<DashboardStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearDashboardError, updateStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;