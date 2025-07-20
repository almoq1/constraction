import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export const setupSocketHandlers = (io: Server) => {
  console.log('🔌 Setting up Socket.io handlers...');

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          language: true
        }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.data.user.name} (${socket.data.user.email})`);

    // Join user to their role-based room
    socket.join(`role-${socket.data.user.role.toLowerCase()}`);
    socket.join(`user-${socket.data.user.id}`);

    // Handle machine hours update
    socket.on('machine-hours-update', async (data) => {
      try {
        const { machineId, hoursWorked, requiredHours, date, notes } = data;

        // Validate data
        if (!machineId || hoursWorked === undefined || requiredHours === undefined) {
          socket.emit('error', { message: 'Invalid data provided' });
          return;
        }

        // Check if machine exists
        const machine = await prisma.machine.findUnique({
          where: { id: machineId }
        });

        if (!machine) {
          socket.emit('error', { message: 'Machine not found' });
          return;
        }

        // Calculate extra hours
        const extraHours = Math.max(0, hoursWorked - requiredHours);

        // Check if hours already recorded for this date
        const existingHours = await prisma.machineHour.findFirst({
          where: {
            machineId,
            date: new Date(date)
          }
        });

        let machineHours;
        if (existingHours) {
          // Update existing record
          machineHours = await prisma.machineHour.update({
            where: { id: existingHours.id },
            data: {
              hoursWorked,
              requiredHours,
              extraHours,
              notes
            }
          });
        } else {
          // Create new record
          machineHours = await prisma.machineHour.create({
            data: {
              machineId,
              date: new Date(date),
              hoursWorked,
              requiredHours,
              extraHours,
              notes
            }
          });
        }

        // Broadcast update to all connected clients
        io.emit('machine-hours-updated', {
          machineId,
          machineHours,
          updatedBy: socket.data.user.name
        });

        socket.emit('success', { message: 'Machine hours updated successfully' });
      } catch (error) {
        console.error('Machine hours update error:', error);
        socket.emit('error', { message: 'Failed to update machine hours' });
      }
    });

    // Handle payment recording
    socket.on('payment-recorded', async (data) => {
      try {
        const { amount, type, description, relatedId, relatedType } = data;

        // Broadcast payment to all connected clients
        io.emit('payment-updated', {
          amount,
          type,
          description,
          relatedId,
          relatedType,
          recordedBy: socket.data.user.name,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Payment broadcast error:', error);
      }
    });

    // Handle contract status change
    socket.on('contract-status-change', async (data) => {
      try {
        const { contractId, newStatus, reason } = data;

        // Broadcast contract status change
        io.emit('contract-status-updated', {
          contractId,
          newStatus,
          reason,
          updatedBy: socket.data.user.name,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Contract status change error:', error);
      }
    });

    // Handle machine assignment
    socket.on('machine-assignment', async (data) => {
      try {
        const { machineId, driverId, assistantId, startDate, endDate } = data;

        // Broadcast machine assignment
        io.emit('machine-assignment-updated', {
          machineId,
          driverId,
          assistantId,
          startDate,
          endDate,
          assignedBy: socket.data.user.name,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Machine assignment error:', error);
      }
    });

    // Handle alert creation
    socket.on('alert-created', async (data) => {
      try {
        const { type, title, message, priority } = data;

        // Broadcast new alert to all users
        io.emit('new-alert', {
          type,
          title,
          message,
          priority,
          createdBy: socket.data.user.name,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Alert creation error:', error);
      }
    });

    // Handle alert read status
    socket.on('alert-read', async (data) => {
      try {
        const { alertId } = data;

        // Broadcast alert read status
        io.emit('alert-read-updated', {
          alertId,
          readBy: socket.data.user.name,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Alert read error:', error);
      }
    });

    // Handle real-time chat (if needed)
    socket.on('chat-message', async (data) => {
      try {
        const { message, recipientId } = data;

        // Send message to specific user or broadcast to all
        if (recipientId) {
          io.to(`user-${recipientId}`).emit('chat-message', {
            message,
            sender: socket.data.user.name,
            senderId: socket.data.user.id,
            timestamp: new Date()
          });
        } else {
          io.emit('chat-message', {
            message,
            sender: socket.data.user.name,
            senderId: socket.data.user.id,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Chat message error:', error);
      }
    });

    // Handle user typing indicator
    socket.on('typing', (data) => {
      const { isTyping, recipientId } = data;
      
      if (recipientId) {
        socket.to(`user-${recipientId}`).emit('user-typing', {
          userId: socket.data.user.id,
          userName: socket.data.user.name,
          isTyping
        });
      } else {
        socket.broadcast.emit('user-typing', {
          userId: socket.data.user.id,
          userName: socket.data.user.name,
          isTyping
        });
      }
    });

    // Handle dashboard refresh request
    socket.on('refresh-dashboard', async () => {
      try {
        // Get updated dashboard data
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const [
          totalMachines,
          availableMachines,
          totalContracts,
          activeContracts,
          unreadAlerts
        ] = await Promise.all([
          prisma.machine.count(),
          prisma.machine.count({ where: { isAvailable: true } }),
          prisma.contract.count(),
          prisma.contract.count({ where: { status: 'ACTIVE' } }),
          prisma.alert.count({ where: { isRead: false } })
        ]);

        // Send updated dashboard data to the requesting user
        socket.emit('dashboard-updated', {
          machines: {
            total: totalMachines,
            available: availableMachines,
            utilization: totalMachines > 0 ? ((totalMachines - availableMachines) / totalMachines * 100).toFixed(1) : '0'
          },
          contracts: {
            total: totalContracts,
            active: activeContracts
          },
          alerts: {
            unread: unreadAlerts
          },
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Dashboard refresh error:', error);
        socket.emit('error', { message: 'Failed to refresh dashboard' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`👤 User disconnected: ${socket.data.user.name} (${socket.data.user.email})`);
    });
  });

  // Broadcast system-wide notifications
  const broadcastNotification = (type: string, title: string, message: string, priority: string = 'MEDIUM') => {
    io.emit('system-notification', {
      type,
      title,
      message,
      priority,
      timestamp: new Date()
    });
  };

  // Export broadcast function for use in other parts of the application
  (io as any).broadcastNotification = broadcastNotification;
};