import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import machineReducer from './slices/machineSlice';
import driverReducer from './slices/driverSlice';
import contractReducer from './slices/contractSlice';
import rentalReducer from './slices/rentalSlice';
import paymentReducer from './slices/paymentSlice';
import alertReducer from './slices/alertSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    machines: machineReducer,
    drivers: driverReducer,
    contracts: contractReducer,
    rentals: rentalReducer,
    payments: paymentReducer,
    alerts: alertReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;