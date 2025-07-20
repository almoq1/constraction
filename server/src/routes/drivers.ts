import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireManager, AuthRequest } from '../middleware/auth';
import moment from 'moment';

const router = Router();

// Get all drivers
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        driverAssignments: {
          where: { isActive: true },
          include: {
            machine: true
          }
        },
        salaryPayments: {
          orderBy: { date: 'desc' },
          take: 10
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ drivers });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ error: 'Failed to get drivers' });
  }
});

// Get single driver
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        driverAssignments: {
          include: {
            machine: true
          }
        },
        salaryPayments: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({ driver });
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({ error: 'Failed to get driver' });
  }
});

// Create driver
router.post('/', [authenticateToken, requireManager], [
  body('name').notEmpty().trim(),
  body('phone').notEmpty().trim(),
  body('licenseNumber').notEmpty().trim(),
  body('experience').isInt({ min: 0 }),
  body('salary').isFloat({ min: 0 })
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      phone,
      licenseNumber,
      experience,
      salary
    } = req.body;

    const driver = await prisma.driver.create({
      data: {
        name,
        phone,
        licenseNumber,
        experience,
        salary
      }
    });

    res.status(201).json({
      message: 'Driver created successfully',
      driver
    });
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({ error: 'Failed to create driver' });
  }
});

// Update driver
router.put('/:id', [authenticateToken, requireManager], [
  body('name').optional().notEmpty().trim(),
  body('phone').optional().notEmpty().trim(),
  body('licenseNumber').optional().notEmpty().trim(),
  body('experience').optional().isInt({ min: 0 }),
  body('salary').optional().isFloat({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('isOnVacation').optional().isBoolean(),
  body('vacationStartDate').optional().isISO8601(),
  body('vacationEndDate').optional().isISO8601()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const driver = await prisma.driver.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Driver updated successfully',
      driver
    });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ error: 'Failed to update driver' });
  }
});

// Delete driver
router.delete('/:id', [authenticateToken, requireManager], async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if driver is currently assigned
    const activeAssignment = await prisma.driverAssignment.findFirst({
      where: { 
        driverId: id,
        isActive: true
      }
    });

    if (activeAssignment) {
      return res.status(400).json({ 
        error: 'Cannot delete driver that is currently assigned to a machine' 
      });
    }

    await prisma.driver.delete({
      where: { id }
    });

    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ error: 'Failed to delete driver' });
  }
});

// Calculate driver salary
router.get('/:id/salary-calculation', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;

    const targetMonth = month ? parseInt(month as string) : moment().month() + 1;
    const targetYear = year ? parseInt(year as string) : moment().year();

    const driver = await prisma.driver.findUnique({
      where: { id }
    });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const startDate = moment(`${targetYear}-${targetMonth}-01`).startOf('month');
    const endDate = moment(startDate).endOf('month');

    // Get vacation days in this month
    const vacationDays = driver.isOnVacation && driver.vacationStartDate && driver.vacationEndDate
      ? moment.duration(
          moment.min(moment(driver.vacationEndDate), endDate)
            .diff(moment.max(moment(driver.vacationStartDate), startDate))
        ).asDays()
      : 0;

    // Get salary payments for this month
    const salaryPayments = await prisma.salaryPayment.findMany({
      where: {
        driverId: id,
        date: {
          gte: startDate.toDate(),
          lte: endDate.toDate()
        }
      }
    });

    const totalPaid = salaryPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate working days (30 days - vacation days)
    const workingDays = Math.max(0, 30 - Math.ceil(vacationDays));
    const dailySalary = driver.salary / 30;
    const earnedSalary = dailySalary * workingDays;
    const remainingSalary = earnedSalary - totalPaid;

    res.json({
      driver,
      period: {
        month: targetMonth,
        year: targetYear,
        startDate: startDate.toDate(),
        endDate: endDate.toDate()
      },
      calculation: {
        monthlySalary: driver.salary,
        dailySalary,
        workingDays,
        vacationDays: Math.ceil(vacationDays),
        earnedSalary: Math.round(earnedSalary * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        remainingSalary: Math.round(remainingSalary * 100) / 100
      },
      payments: salaryPayments
    });
  } catch (error) {
    console.error('Calculate salary error:', error);
    res.status(500).json({ error: 'Failed to calculate salary' });
  }
});

// Pay driver salary
router.post('/:id/pay-salary', [authenticateToken, requireManager], [
  body('amount').isFloat({ min: 0 }),
  body('type').isIn(['SALARY']),
  body('date').isISO8601(),
  body('description').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { amount, type, date, description } = req.body;

    // Check if driver exists
    const driver = await prisma.driver.findUnique({
      where: { id }
    });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const payment = await prisma.salaryPayment.create({
      data: {
        driverId: id,
        amount,
        type,
        date: new Date(date),
        description,
        createdById: req.user!.id
      },
      include: {
        driver: true
      }
    });

    res.status(201).json({
      message: 'Salary payment recorded successfully',
      payment
    });
  } catch (error) {
    console.error('Pay salary error:', error);
    res.status(500).json({ error: 'Failed to record salary payment' });
  }
});

// Get driver assignments
router.get('/:id/assignments', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const assignments = await prisma.driverAssignment.findMany({
      where: { driverId: id },
      include: {
        machine: true
      },
      orderBy: { startDate: 'desc' }
    });

    res.json({ assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to get assignments' });
  }
});

// ASSISTANT ROUTES

// Get all assistants
router.get('/assistants', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const assistants = await prisma.driverAssistant.findMany({
      include: {
        assistantAssignments: {
          where: { isActive: true },
          include: {
            machine: true
          }
        },
        salaryPayments: {
          orderBy: { date: 'desc' },
          take: 10
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ assistants });
  } catch (error) {
    console.error('Get assistants error:', error);
    res.status(500).json({ error: 'Failed to get assistants' });
  }
});

// Get single assistant
router.get('/assistants/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const assistant = await prisma.driverAssistant.findUnique({
      where: { id },
      include: {
        assistantAssignments: {
          include: {
            machine: true
          }
        },
        salaryPayments: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!assistant) {
      return res.status(404).json({ error: 'Assistant not found' });
    }

    res.json({ assistant });
  } catch (error) {
    console.error('Get assistant error:', error);
    res.status(500).json({ error: 'Failed to get assistant' });
  }
});

// Create assistant
router.post('/assistants', [authenticateToken, requireManager], [
  body('name').notEmpty().trim(),
  body('phone').notEmpty().trim(),
  body('experience').isInt({ min: 0 }),
  body('salary').isFloat({ min: 0 })
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      phone,
      experience,
      salary
    } = req.body;

    const assistant = await prisma.driverAssistant.create({
      data: {
        name,
        phone,
        experience,
        salary
      }
    });

    res.status(201).json({
      message: 'Assistant created successfully',
      assistant
    });
  } catch (error) {
    console.error('Create assistant error:', error);
    res.status(500).json({ error: 'Failed to create assistant' });
  }
});

// Update assistant
router.put('/assistants/:id', [authenticateToken, requireManager], [
  body('name').optional().notEmpty().trim(),
  body('phone').optional().notEmpty().trim(),
  body('experience').optional().isInt({ min: 0 }),
  body('salary').optional().isFloat({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('isOnVacation').optional().isBoolean(),
  body('vacationStartDate').optional().isISO8601(),
  body('vacationEndDate').optional().isISO8601()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const assistant = await prisma.driverAssistant.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Assistant updated successfully',
      assistant
    });
  } catch (error) {
    console.error('Update assistant error:', error);
    res.status(500).json({ error: 'Failed to update assistant' });
  }
});

// Delete assistant
router.delete('/assistants/:id', [authenticateToken, requireManager], async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if assistant is currently assigned
    const activeAssignment = await prisma.assistantAssignment.findFirst({
      where: { 
        assistantId: id,
        isActive: true
      }
    });

    if (activeAssignment) {
      return res.status(400).json({ 
        error: 'Cannot delete assistant that is currently assigned to a machine' 
      });
    }

    await prisma.driverAssistant.delete({
      where: { id }
    });

    res.json({ message: 'Assistant deleted successfully' });
  } catch (error) {
    console.error('Delete assistant error:', error);
    res.status(500).json({ error: 'Failed to delete assistant' });
  }
});

// Calculate assistant salary
router.get('/assistants/:id/salary-calculation', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;

    const targetMonth = month ? parseInt(month as string) : moment().month() + 1;
    const targetYear = year ? parseInt(year as string) : moment().year();

    const assistant = await prisma.driverAssistant.findUnique({
      where: { id }
    });

    if (!assistant) {
      return res.status(404).json({ error: 'Assistant not found' });
    }

    const startDate = moment(`${targetYear}-${targetMonth}-01`).startOf('month');
    const endDate = moment(startDate).endOf('month');

    // Get vacation days in this month
    const vacationDays = assistant.isOnVacation && assistant.vacationStartDate && assistant.vacationEndDate
      ? moment.duration(
          moment.min(moment(assistant.vacationEndDate), endDate)
            .diff(moment.max(moment(assistant.vacationStartDate), startDate))
        ).asDays()
      : 0;

    // Get salary payments for this month
    const salaryPayments = await prisma.salaryPayment.findMany({
      where: {
        assistantId: id,
        date: {
          gte: startDate.toDate(),
          lte: endDate.toDate()
        }
      }
    });

    const totalPaid = salaryPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate working days (30 days - vacation days)
    const workingDays = Math.max(0, 30 - Math.ceil(vacationDays));
    const dailySalary = assistant.salary / 30;
    const earnedSalary = dailySalary * workingDays;
    const remainingSalary = earnedSalary - totalPaid;

    res.json({
      assistant,
      period: {
        month: targetMonth,
        year: targetYear,
        startDate: startDate.toDate(),
        endDate: endDate.toDate()
      },
      calculation: {
        monthlySalary: assistant.salary,
        dailySalary,
        workingDays,
        vacationDays: Math.ceil(vacationDays),
        earnedSalary: Math.round(earnedSalary * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        remainingSalary: Math.round(remainingSalary * 100) / 100
      },
      payments: salaryPayments
    });
  } catch (error) {
    console.error('Calculate assistant salary error:', error);
    res.status(500).json({ error: 'Failed to calculate assistant salary' });
  }
});

// Pay assistant salary
router.post('/assistants/:id/pay-salary', [authenticateToken, requireManager], [
  body('amount').isFloat({ min: 0 }),
  body('type').isIn(['SALARY']),
  body('date').isISO8601(),
  body('description').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { amount, type, date, description } = req.body;

    // Check if assistant exists
    const assistant = await prisma.driverAssistant.findUnique({
      where: { id }
    });

    if (!assistant) {
      return res.status(404).json({ error: 'Assistant not found' });
    }

    const payment = await prisma.salaryPayment.create({
      data: {
        assistantId: id,
        amount,
        type,
        date: new Date(date),
        description,
        createdById: req.user!.id
      },
      include: {
        assistant: true
      }
    });

    res.status(201).json({
      message: 'Assistant salary payment recorded successfully',
      payment
    });
  } catch (error) {
    console.error('Pay assistant salary error:', error);
    res.status(500).json({ error: 'Failed to record assistant salary payment' });
  }
});

export default router;