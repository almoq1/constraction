import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to calculate working days
const calculateWorkingDays = (startDate: Date, endDate?: Date) => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  let workingDays = 0;
  const current = new Date(start);
  
  while (current <= end) {
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return workingDays;
};

// Helper function to calculate leave days
const calculateLeaveDays = async (driverId?: string, assistantId?: string) => {
  const leaveRecords = await prisma.leaveRecord.findMany({
    where: {
      OR: [
        { driverId: driverId || undefined },
        { assistantId: assistantId || undefined }
      ],
      isApproved: true
    }
  });

  let totalLeaveDays = 0;
  leaveRecords.forEach(leave => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    let days = 0;
    const current = new Date(start);
    
    while (current <= end) {
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }
    totalLeaveDays += days;
  });

  return totalLeaveDays;
};

// ==================== DRIVER ACCOUNTS ====================

// Create driver account
router.post('/driver', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('driverId').notEmpty(),
  body('startDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, driverId, startDate } = req.body;

    // Check if driver exists
    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Check if account already exists
    const existingAccount = await prisma.driverAccount.findUnique({
      where: { driverId }
    });

    if (existingAccount) {
      return res.status(400).json({ error: 'Driver account already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: driver.name,
        role: 'USER'
      }
    });

    // Create driver account
    const driverAccount = await prisma.driverAccount.create({
      data: {
        userId: user.id,
        driverId,
        startDate: new Date(startDate),
        totalWorkingDays: calculateWorkingDays(new Date(startDate)),
        totalLeaveDays: await calculateLeaveDays(driverId),
        netWorkingDays: calculateWorkingDays(new Date(startDate)) - await calculateLeaveDays(driverId),
        totalSalaryEarned: driver.salary * (calculateWorkingDays(new Date(startDate)) / 30),
        totalSalaryPaid: 0,
        remainingSalary: driver.salary * (calculateWorkingDays(new Date(startDate)) / 30)
      },
      include: {
        user: true,
        driver: true
      }
    });

    res.status(201).json({
      success: true,
      data: driverAccount
    });
  } catch (error) {
    console.error('Error creating driver account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Driver login
router.post('/driver/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user with driver account
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        driverAccount: {
          include: {
            driver: true
          }
        }
      }
    });

    if (!user || !user.driverAccount) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.driverAccount.update({
      where: { userId: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        accountType: 'driver',
        driverId: user.driverAccount.driverId
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountType: 'driver',
          driverAccount: user.driverAccount
        }
      }
    });
  } catch (error) {
    console.error('Error in driver login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get driver dashboard
router.get('/driver/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const driverId = (req as any).user.driverId;

    const driverAccount = await prisma.driverAccount.findUnique({
      where: { userId },
      include: {
        driver: {
          include: {
            driverAssignments: {
              include: {
                machine: true
              }
            },
            salaryPayments: {
              orderBy: { date: 'desc' },
              take: 10
            },
            leaveRecords: {
              orderBy: { startDate: 'desc' },
              take: 10
            }
          }
        }
      }
    });

    if (!driverAccount) {
      return res.status(404).json({ error: 'Driver account not found' });
    }

    // Calculate current month statistics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentMonthWorkingDays = calculateWorkingDays(startOfMonth, endOfMonth);
    const currentMonthLeaveDays = await calculateLeaveDays(driverId);
    const currentMonthNetDays = currentMonthWorkingDays - currentMonthLeaveDays;

    const dashboard = {
      account: driverAccount,
      currentMonth: {
        workingDays: currentMonthWorkingDays,
        leaveDays: currentMonthLeaveDays,
        netWorkingDays: currentMonthNetDays,
        salaryEarned: (driverAccount.driver.salary / 30) * currentMonthNetDays,
        salaryPaid: 0 // This would be calculated from salary payments
      },
      assignedMachines: driverAccount.driver.driverAssignments.filter(da => da.isActive),
      recentPayments: driverAccount.driver.salaryPayments,
      recentLeaves: driverAccount.driver.leaveRecords
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Error getting driver dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ASSISTANT ACCOUNTS ====================

// Create assistant account
router.post('/assistant', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('assistantId').notEmpty(),
  body('startDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, assistantId, startDate } = req.body;

    // Check if assistant exists
    const assistant = await prisma.driverAssistant.findUnique({
      where: { id: assistantId }
    });

    if (!assistant) {
      return res.status(404).json({ error: 'Assistant not found' });
    }

    // Check if account already exists
    const existingAccount = await prisma.assistantAccount.findUnique({
      where: { assistantId }
    });

    if (existingAccount) {
      return res.status(400).json({ error: 'Assistant account already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: assistant.name,
        role: 'USER'
      }
    });

    // Create assistant account
    const assistantAccount = await prisma.assistantAccount.create({
      data: {
        userId: user.id,
        assistantId,
        startDate: new Date(startDate),
        totalWorkingDays: calculateWorkingDays(new Date(startDate)),
        totalLeaveDays: await calculateLeaveDays(undefined, assistantId),
        netWorkingDays: calculateWorkingDays(new Date(startDate)) - await calculateLeaveDays(undefined, assistantId),
        totalSalaryEarned: assistant.salary * (calculateWorkingDays(new Date(startDate)) / 30),
        totalSalaryPaid: 0,
        remainingSalary: assistant.salary * (calculateWorkingDays(new Date(startDate)) / 30)
      },
      include: {
        user: true,
        assistant: true
      }
    });

    res.status(201).json({
      success: true,
      data: assistantAccount
    });
  } catch (error) {
    console.error('Error creating assistant account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assistant login
router.post('/assistant/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user with assistant account
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        assistantAccount: {
          include: {
            assistant: true
          }
        }
      }
    });

    if (!user || !user.assistantAccount) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.assistantAccount.update({
      where: { userId: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        accountType: 'assistant',
        assistantId: user.assistantAccount.assistantId
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountType: 'assistant',
          assistantAccount: user.assistantAccount
        }
      }
    });
  } catch (error) {
    console.error('Error in assistant login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get assistant dashboard
router.get('/assistant/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const assistantId = (req as any).user.assistantId;

    const assistantAccount = await prisma.assistantAccount.findUnique({
      where: { userId },
      include: {
        assistant: {
          include: {
            assistantAssignments: {
              include: {
                machine: true
              }
            },
            salaryPayments: {
              orderBy: { date: 'desc' },
              take: 10
            },
            leaveRecords: {
              orderBy: { startDate: 'desc' },
              take: 10
            }
          }
        }
      }
    });

    if (!assistantAccount) {
      return res.status(404).json({ error: 'Assistant account not found' });
    }

    // Calculate current month statistics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentMonthWorkingDays = calculateWorkingDays(startOfMonth, endOfMonth);
    const currentMonthLeaveDays = await calculateLeaveDays(undefined, assistantId);
    const currentMonthNetDays = currentMonthWorkingDays - currentMonthLeaveDays;

    const dashboard = {
      account: assistantAccount,
      currentMonth: {
        workingDays: currentMonthWorkingDays,
        leaveDays: currentMonthLeaveDays,
        netWorkingDays: currentMonthNetDays,
        salaryEarned: (assistantAccount.assistant.salary / 30) * currentMonthNetDays,
        salaryPaid: 0 // This would be calculated from salary payments
      },
      assignedMachines: assistantAccount.assistant.assistantAssignments.filter(aa => aa.isActive),
      recentPayments: assistantAccount.assistant.salaryPayments,
      recentLeaves: assistantAccount.assistant.leaveRecords
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Error getting assistant dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== TENANT ACCOUNTS ====================

// Create tenant account
router.post('/tenant', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('tenantName').notEmpty(),
  body('tenantPhone').notEmpty(),
  body('rentalType').isIn(['LAND', 'ROOM']),
  body('rentalId').notEmpty(),
  body('startDate').isISO8601(),
  body('monthlyRent').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      email, 
      password, 
      tenantName, 
      tenantPhone, 
      rentalType, 
      rentalId, 
      startDate, 
      monthlyRent 
    } = req.body;

    // Check if rental exists
    let rental;
    if (rentalType === 'LAND') {
      rental = await prisma.landRental.findUnique({
        where: { id: rentalId }
      });
    } else {
      rental = await prisma.roomRental.findUnique({
        where: { id: rentalId }
      });
    }

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Check if account already exists
    const existingAccount = await prisma.tenantAccount.findFirst({
      where: { 
        tenantPhone,
        rentalId,
        rentalType
      }
    });

    if (existingAccount) {
      return res.status(400).json({ error: 'Tenant account already exists for this rental' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: tenantName,
        role: 'USER'
      }
    });

    // Calculate rent due
    const start = new Date(startDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    const totalRentDue = monthlyRent * monthsDiff;

    // Create tenant account
    const tenantAccount = await prisma.tenantAccount.create({
      data: {
        userId: user.id,
        tenantName,
        tenantPhone,
        rentalType,
        rentalId,
        startDate: new Date(startDate),
        monthlyRent,
        totalRentDue,
        totalRentPaid: 0,
        remainingRent: totalRentDue,
        advancePayments: rental.advancePayments || 0
      },
      include: {
        user: true
      }
    });

    res.status(201).json({
      success: true,
      data: tenantAccount
    });
  } catch (error) {
    console.error('Error creating tenant account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tenant login
router.post('/tenant/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user with tenant account
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenantAccount: true
      }
    });

    if (!user || !user.tenantAccount) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.tenantAccount.update({
      where: { userId: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        accountType: 'tenant',
        tenantId: user.tenantAccount.id
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountType: 'tenant',
          tenantAccount: user.tenantAccount
        }
      }
    });
  } catch (error) {
    console.error('Error in tenant login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tenant dashboard
router.get('/tenant/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const tenantAccount = await prisma.tenantAccount.findUnique({
      where: { userId },
      include: {
        user: true
      }
    });

    if (!tenantAccount) {
      return res.status(404).json({ error: 'Tenant account not found' });
    }

    // Get rental details
    let rental;
    if (tenantAccount.rentalType === 'LAND') {
      rental = await prisma.landRental.findUnique({
        where: { id: tenantAccount.rentalId },
        include: {
          land: true
        }
      });
    } else {
      rental = await prisma.roomRental.findUnique({
        where: { id: tenantAccount.rentalId },
        include: {
          room: true
        }
      });
    }

    // Calculate current statistics
    const start = new Date(tenantAccount.startDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    const totalRentDue = tenantAccount.monthlyRent * monthsDiff;
    const remainingRent = totalRentDue - tenantAccount.totalRentPaid;

    const dashboard = {
      account: tenantAccount,
      rental,
      statistics: {
        totalMonths: monthsDiff,
        totalRentDue,
        totalRentPaid: tenantAccount.totalRentPaid,
        remainingRent,
        advancePayments: tenantAccount.advancePayments
      }
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Error getting tenant dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== MACHINE PARKER ACCOUNTS ====================

// Create machine parker account
router.post('/machine-parker', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('parkerName').notEmpty(),
  body('parkerPhone').notEmpty(),
  body('landId').notEmpty(),
  body('startDate').isISO8601(),
  body('totalMachines').isInt({ min: 1 }),
  body('farePerMachine').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      email, 
      password, 
      parkerName, 
      parkerPhone, 
      landId, 
      startDate, 
      totalMachines, 
      farePerMachine 
    } = req.body;

    // Check if land exists
    const land = await prisma.land.findUnique({
      where: { id: landId }
    });

    if (!land) {
      return res.status(404).json({ error: 'Land not found' });
    }

    // Check if account already exists
    const existingAccount = await prisma.machineParkerAccount.findFirst({
      where: { 
        parkerPhone,
        landId
      }
    });

    if (existingAccount) {
      return res.status(400).json({ error: 'Machine parker account already exists for this land' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: parkerName,
        role: 'USER'
      }
    });

    // Calculate fare due
    const start = new Date(startDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    const totalFareDue = farePerMachine * totalMachines * monthsDiff;

    // Create machine parker account
    const machineParkerAccount = await prisma.machineParkerAccount.create({
      data: {
        userId: user.id,
        parkerName,
        parkerPhone,
        landId,
        startDate: new Date(startDate),
        totalMachines,
        farePerMachine,
        totalFareDue,
        totalFarePaid: 0,
        remainingFare: totalFareDue
      },
      include: {
        user: true
      }
    });

    res.status(201).json({
      success: true,
      data: machineParkerAccount
    });
  } catch (error) {
    console.error('Error creating machine parker account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Machine parker login
router.post('/machine-parker/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user with machine parker account
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        machineParkerAccount: true
      }
    });

    if (!user || !user.machineParkerAccount) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.machineParkerAccount.update({
      where: { userId: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        accountType: 'machineParker',
        parkerId: user.machineParkerAccount.id
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountType: 'machineParker',
          machineParkerAccount: user.machineParkerAccount
        }
      }
    });
  } catch (error) {
    console.error('Error in machine parker login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get machine parker dashboard
router.get('/machine-parker/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const machineParkerAccount = await prisma.machineParkerAccount.findUnique({
      where: { userId },
      include: {
        user: true
      }
    });

    if (!machineParkerAccount) {
      return res.status(404).json({ error: 'Machine parker account not found' });
    }

    // Get land details
    const land = await prisma.land.findUnique({
      where: { id: machineParkerAccount.landId }
    });

    // Calculate current statistics
    const start = new Date(machineParkerAccount.startDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    const totalFareDue = machineParkerAccount.farePerMachine * machineParkerAccount.totalMachines * monthsDiff;
    const remainingFare = totalFareDue - machineParkerAccount.totalFarePaid;

    const dashboard = {
      account: machineParkerAccount,
      land,
      statistics: {
        totalMonths: monthsDiff,
        totalFareDue,
        totalFarePaid: machineParkerAccount.totalFarePaid,
        remainingFare,
        monthlyFare: machineParkerAccount.farePerMachine * machineParkerAccount.totalMachines
      }
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Error getting machine parker dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== LEAVE MANAGEMENT ====================

// Request leave
router.post('/leave', authenticateToken, [
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('leaveType').isIn(['VACATION', 'SICK', 'PERSONAL', 'OTHER']),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate, leaveType, reason } = req.body;
    const userId = (req as any).user.userId;
    const accountType = (req as any).user.accountType;

    let driverId, assistantId;

    if (accountType === 'driver') {
      const driverAccount = await prisma.driverAccount.findUnique({
        where: { userId }
      });
      driverId = driverAccount?.driverId;
    } else if (accountType === 'assistant') {
      const assistantAccount = await prisma.assistantAccount.findUnique({
        where: { userId }
      });
      assistantId = assistantAccount?.assistantId;
    }

    const leaveRecord = await prisma.leaveRecord.create({
      data: {
        driverId,
        assistantId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        leaveType,
        reason
      }
    });

    res.status(201).json({
      success: true,
      data: leaveRecord
    });
  } catch (error) {
    console.error('Error requesting leave:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leave history
router.get('/leave/history', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const accountType = (req as any).user.accountType;

    let driverId, assistantId;

    if (accountType === 'driver') {
      const driverAccount = await prisma.driverAccount.findUnique({
        where: { userId }
      });
      driverId = driverAccount?.driverId;
    } else if (accountType === 'assistant') {
      const assistantAccount = await prisma.assistantAccount.findUnique({
        where: { userId }
      });
      assistantId = assistantAccount?.assistantId;
    }

    const leaveRecords = await prisma.leaveRecord.findMany({
      where: {
        OR: [
          { driverId: driverId || undefined },
          { assistantId: assistantId || undefined }
        ]
      },
      orderBy: { startDate: 'desc' }
    });

    res.json({
      success: true,
      data: leaveRecords
    });
  } catch (error) {
    console.error('Error getting leave history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;