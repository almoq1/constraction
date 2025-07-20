import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireManager, AuthRequest } from '../middleware/auth';
import moment from 'moment';

const router = Router();

// Get all alerts
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { isRead, priority, type, page = 1, limit = 20 } = req.query;

    const where: any = {};
    
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (type) {
      where.type = type;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: parseInt(limit as string)
    });

    const total = await prisma.alert.count({ where });
    const unreadCount = await prisma.alert.count({ where: { isRead: false } });

    res.json({
      alerts,
      unreadCount,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

// Get single alert
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.findUnique({
      where: { id }
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ alert });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({ error: 'Failed to get alert' });
  }
});

// Create alert
router.post('/', [authenticateToken, requireManager], [
  body('type').isIn(['RENT_DUE', 'SALARY_DUE', 'CONTRACT_EXPIRY', 'MACHINE_MAINTENANCE', 'GENERAL']),
  body('title').notEmpty().trim(),
  body('message').notEmpty().trim(),
  body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      type,
      title,
      message,
      priority
    } = req.body;

    const alert = await prisma.alert.create({
      data: {
        type,
        title,
        message,
        priority
      }
    });

    res.status(201).json({
      message: 'Alert created successfully',
      alert
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Mark alert as read
router.put('/:id/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({
      message: 'Alert marked as read',
      alert
    });
  } catch (error) {
    console.error('Mark alert as read error:', error);
    res.status(500).json({ error: 'Failed to mark alert as read' });
  }
});

// Mark all alerts as read
router.put('/read-all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await prisma.alert.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });

    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    console.error('Mark all alerts as read error:', error);
    res.status(500).json({ error: 'Failed to mark all alerts as read' });
  }
});

// Delete alert
router.delete('/:id', [authenticateToken, requireManager], async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.alert.delete({
      where: { id }
    });

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

// Get rent due alerts
router.get('/rent-due', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const today = new Date();
    const nextWeek = moment().add(7, 'days').toDate();

    // Get land rentals due for payment
    const landRentals = await prisma.landRental.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: today,
          lte: nextWeek
        }
      },
      include: {
        land: true
      }
    });

    // Get room rentals due for payment
    const roomRentals = await prisma.roomRental.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: today,
          lte: nextWeek
        }
      },
      include: {
        room: true
      }
    });

    const rentDueAlerts = [];

    // Process land rentals
    for (const rental of landRentals) {
      const daysUntilDue = moment(rental.endDate).diff(moment(), 'days');
      
      if (daysUntilDue <= 7) {
        rentDueAlerts.push({
          id: `land-${rental.id}`,
          type: 'RENT_DUE',
          title: `Land Rent Due: ${rental.land.name}`,
          message: `Rent for ${rental.land.name} is due in ${daysUntilDue} days. Tenant: ${rental.tenantName}`,
          priority: daysUntilDue <= 3 ? 'HIGH' : 'MEDIUM',
          dueDate: rental.endDate,
          rentalType: 'land',
          rentalId: rental.id,
          tenantName: rental.tenantName,
          amount: rental.monthlyRent
        });
      }
    }

    // Process room rentals
    for (const rental of roomRentals) {
      const daysUntilDue = moment(rental.endDate).diff(moment(), 'days');
      
      if (daysUntilDue <= 7) {
        rentDueAlerts.push({
          id: `room-${rental.id}`,
          type: 'RENT_DUE',
          title: `Room Rent Due: ${rental.room.name}`,
          message: `Rent for ${rental.room.name} is due in ${daysUntilDue} days. Tenant: ${rental.tenantName}`,
          priority: daysUntilDue <= 3 ? 'HIGH' : 'MEDIUM',
          dueDate: rental.endDate,
          rentalType: 'room',
          rentalId: rental.id,
          tenantName: rental.tenantName,
          amount: rental.monthlyRent
        });
      }
    }

    res.json({ rentDueAlerts });
  } catch (error) {
    console.error('Get rent due alerts error:', error);
    res.status(500).json({ error: 'Failed to get rent due alerts' });
  }
});

// Get contract expiry alerts
router.get('/contract-expiry', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const today = new Date();
    const nextMonth = moment().add(30, 'days').toDate();

    const contracts = await prisma.contract.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: today,
          lte: nextMonth
        }
      },
      include: {
        contractMachines: {
          include: {
            machine: true
          }
        }
      }
    });

    const contractExpiryAlerts = [];

    for (const contract of contracts) {
      const daysUntilExpiry = moment(contract.endDate).diff(moment(), 'days');
      
      if (daysUntilExpiry <= 30) {
        contractExpiryAlerts.push({
          id: `contract-${contract.id}`,
          type: 'CONTRACT_EXPIRY',
          title: `Contract Expiring: ${contract.title}`,
          message: `Contract "${contract.title}" with ${contract.clientName} expires in ${daysUntilExpiry} days`,
          priority: daysUntilExpiry <= 7 ? 'HIGH' : daysUntilExpiry <= 14 ? 'MEDIUM' : 'LOW',
          expiryDate: contract.endDate,
          contractId: contract.id,
          clientName: contract.clientName,
          totalAmount: contract.totalAmount,
          machineCount: contract.contractMachines.length
        });
      }
    }

    res.json({ contractExpiryAlerts });
  } catch (error) {
    console.error('Get contract expiry alerts error:', error);
    res.status(500).json({ error: 'Failed to get contract expiry alerts' });
  }
});

// Get salary due alerts
router.get('/salary-due', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const today = new Date();
    const currentMonth = moment().month();
    const currentYear = moment().year();

    // Get drivers with pending salary
    const drivers = await prisma.driver.findMany({
      where: { isActive: true },
      include: {
        salaryPayments: {
          where: {
            date: {
              gte: moment().startOf('month').toDate(),
              lte: moment().endOf('month').toDate()
            }
          }
        }
      }
    });

    // Get assistants with pending salary
    const assistants = await prisma.driverAssistant.findMany({
      where: { isActive: true },
      include: {
        salaryPayments: {
          where: {
            date: {
              gte: moment().startOf('month').toDate(),
              lte: moment().endOf('month').toDate()
            }
          }
        }
      }
    });

    const salaryDueAlerts = [];

    // Process drivers
    for (const driver of drivers) {
      const totalPaid = driver.salaryPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingSalary = driver.salary - totalPaid;
      
      if (remainingSalary > 0) {
        salaryDueAlerts.push({
          id: `driver-${driver.id}`,
          type: 'SALARY_DUE',
          title: `Salary Due: ${driver.name}`,
          message: `Driver ${driver.name} has ${remainingSalary.toFixed(2)} remaining salary for this month`,
          priority: remainingSalary > driver.salary * 0.5 ? 'HIGH' : 'MEDIUM',
          personType: 'driver',
          personId: driver.id,
          personName: driver.name,
          totalSalary: driver.salary,
          paidAmount: totalPaid,
          remainingAmount: remainingSalary
        });
      }
    }

    // Process assistants
    for (const assistant of assistants) {
      const totalPaid = assistant.salaryPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingSalary = assistant.salary - totalPaid;
      
      if (remainingSalary > 0) {
        salaryDueAlerts.push({
          id: `assistant-${assistant.id}`,
          type: 'SALARY_DUE',
          title: `Salary Due: ${assistant.name}`,
          message: `Assistant ${assistant.name} has ${remainingSalary.toFixed(2)} remaining salary for this month`,
          priority: remainingSalary > assistant.salary * 0.5 ? 'HIGH' : 'MEDIUM',
          personType: 'assistant',
          personId: assistant.id,
          personName: assistant.name,
          totalSalary: assistant.salary,
          paidAmount: totalPaid,
          remainingAmount: remainingSalary
        });
      }
    }

    res.json({ salaryDueAlerts });
  } catch (error) {
    console.error('Get salary due alerts error:', error);
    res.status(500).json({ error: 'Failed to get salary due alerts' });
  }
});

export default router;