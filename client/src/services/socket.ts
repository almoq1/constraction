import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('🔌 Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔌 Socket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔌 Socket reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔌 Socket reconnection failed');
    });
  }

  public connect() {
    if (this.socket && !this.isConnected) {
      this.socket.connect();
    }
  }

  public disconnect() {
    if (this.socket && this.isConnected) {
      this.socket.disconnect();
    }
  }

  public emit(event: string, data?: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('🔌 Socket not connected, cannot emit event:', event);
    }
  }

  public on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  public isSocketConnected(): boolean {
    return this.isConnected;
  }

  // Specific event handlers for the application
  public onAlert(callback: (alert: any) => void) {
    this.on('alert', callback);
  }

  public onPaymentUpdate(callback: (payment: any) => void) {
    this.on('payment_update', callback);
  }

  public onMachineStatusChange(callback: (machine: any) => void) {
    this.on('machine_status_change', callback);
  }

  public onDriverUpdate(callback: (driver: any) => void) {
    this.on('driver_update', callback);
  }

  public onContractUpdate(callback: (contract: any) => void) {
    this.on('contract_update', callback);
  }

  public onRentalUpdate(callback: (rental: any) => void) {
    this.on('rental_update', callback);
  }

  public onDashboardUpdate(callback: (data: any) => void) {
    this.on('dashboard_update', callback);
  }

  public onNotification(callback: (notification: any) => void) {
    this.on('notification', callback);
  }

  // Join specific rooms
  public joinRoom(room: string) {
    this.emit('join_room', { room });
  }

  public leaveRoom(room: string) {
    this.emit('leave_room', { room });
  }

  // Authentication
  public authenticate(token: string) {
    this.emit('authenticate', { token });
  }

  // Request data updates
  public requestDashboardUpdate() {
    this.emit('request_dashboard_update');
  }

  public requestAlertsUpdate() {
    this.emit('request_alerts_update');
  }

  public requestPaymentsUpdate() {
    this.emit('request_payments_update');
  }

  // Cleanup
  public cleanup() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;