import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireManager, AuthRequest } from '../middleware/auth';
import moment from 'moment';

const router = Router();

// Get all machines
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const machines = await prisma.machine.findMany({
      include: {
        machineAssignments: {
          where: { isActive: true },
          include: {
            driver: true,
            assistant: true
          }
        },
        contractMachines: {
          include: {
            contract: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ machines });
  } catch (error) {
    console.error('Get machines error:', error);
    res.status(500).json({ error: 'Failed to get machines' });
  }
});

// Get single machine
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const machine = await prisma.machine.findUnique({
      where: { id },
      include: {
        machineAssignments: {
          include: {
            driver: true,
            assistant: true
          }
        },
        contractMachines: {
          include: {
            contract: true
          }
        },
        machineHours: {
          orderBy: { date: 'desc' },
          take: 30 // Last 30 days
        }
      }
    });

    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    res.json({ machine });
  } catch (error) {
    console.error('Get machine error:', error);
    res.status(500).json({ error: 'Failed to get machine' });
  }
});

// Create machine
router.post('/', [authenticateToken, requireManager], [
  body('name').notEmpty().trim(),
  body('type').isIn(['EXCAVATOR', 'BULLDOZER', 'CRANE', 'TRUCK', 'LOADER', 'OTHER']),
  body('model').notEmpty().trim(),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() }),
  body('dailyRate').isFloat({ min: 0 }),
  body('hourlyRate').isFloat({ min: 0 }),
  body('capacity').optional().trim(),
  body('description').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      type,
      model,
      year,
      dailyRate,
      hourlyRate,
      capacity,
      description
    } = req.body;

    const machine = await prisma.machine.create({
      data: {
        name,
        type,
        model,
        year,
        dailyRate,
        hourlyRate,
        capacity,
        description
      }
    });

    res.status(201).json({
      message: 'Machine created successfully',
      machine
    });
  } catch (error) {
    console.error('Create machine error:', error);
    res.status(500).json({ error: 'Failed to create machine' });
  }
});

// Update machine
router.put('/:id', [authenticateToken, requireManager], [
  body('name').optional().notEmpty().trim(),
  body('type').optional().isIn(['EXCAVATOR', 'BULLDOZER', 'CRANE', 'TRUCK', 'LOADER', 'OTHER']),
  body('model').optional().notEmpty().trim(),
  body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() }),
  body('dailyRate').optional().isFloat({ min: 0 }),
  body('hourlyRate').optional().isFloat({ min: 0 }),
  body('capacity').optional().trim(),
  body('description').optional().trim(),
  body('isAvailable').optional().isBoolean()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const machine = await prisma.machine.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Machine updated successfully',
      machine
    });
  } catch (error) {
    console.error('Update machine error:', error);
    res.status(500).json({ error: 'Failed to update machine' });
  }
});

// Delete machine
router.delete('/:id', [authenticateToken, requireManager], async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if machine is assigned to any contracts
    const activeContracts = await prisma.contractMachine.findFirst({
      where: { machineId: id }
    });

    if (activeContracts) {
      return res.status(400).json({ 
        error: 'Cannot delete machine that is assigned to active contracts' 
      });
    }

    await prisma.machine.delete({
      where: { id }
    });

    res.json({ message: 'Machine deleted successfully' });
  } catch (error) {
    console.error('Delete machine error:', error);
    res.status(500).json({ error: 'Failed to delete machine' });
  }
});

// Assign driver and assistant to machine
router.post('/:id/assign', [authenticateToken, requireManager], [
  body('driverId').optional().isString(),
  body('assistantId').optional().isString(),
  body('startDate').isISO8601(),
  body('endDate').optional().isISO8601()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { driverId, assistantId, startDate, endDate } = req.body;

    // Check if machine exists
    const machine = await prisma.machine.findUnique({
      where: { id }
    });

    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    // Check if driver exists (if provided)
    if (driverId) {
      const driver = await prisma.driver.findUnique({
        where: { id: driverId }
      });
      if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
      }
    }

    // Check if assistant exists (if provided)
    if (assistantId) {
      const assistant = await prisma.driverAssistant.findUnique({
        where: { id: assistantId }
      });
      if (!assistant) {
        return res.status(404).json({ error: 'Assistant not found' });
      }
    }

    // Deactivate any existing active assignments
    await prisma.machineAssignment.updateMany({
      where: { 
        machineId: id,
        isActive: true
      },
      data: { 
        isActive: false,
        endDate: new Date()
      }
    });

    // Create new assignment
    const assignment = await prisma.machineAssignment.create({
      data: {
        machineId: id,
        driverId,
        assistantId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        driver: true,
        assistant: true,
        machine: true
      }
    });

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Assign machine error:', error);
    res.status(500).json({ error: 'Failed to assign machine' });
  }
});

// Record machine hours
router.post('/:id/hours', [authenticateToken, requireManager], [
  body('date').isISO8601(),
  body('hoursWorked').isFloat({ min: 0, max: 24 }),
  body('requiredHours').isFloat({ min: 0, max: 24 }),
  body('notes').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { date, hoursWorked, requiredHours, notes } = req.body;

    // Check if machine exists
    const machine = await prisma.machine.findUnique({
      where: { id }
    });

    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    // Calculate extra hours
    const extraHours = Math.max(0, hoursWorked - requiredHours);

    // Check if hours already recorded for this date
    const existingHours = await prisma.machineHour.findFirst({
      where: {
        machineId: id,
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
          machineId: id,
          date: new Date(date),
          hoursWorked,
          requiredHours,
          extraHours,
          notes
        }
      });
    }

    res.status(201).json({
      message: 'Machine hours recorded successfully',
      machineHours
    });
  } catch (error) {
    console.error('Record machine hours error:', error);
    res.status(500).json({ error: 'Failed to record machine hours' });
  }
});

// Get machine hours report
router.get('/:id/hours-report', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : moment().startOf('month').toDate();
    const end = endDate ? new Date(endDate as string) : moment().endOf('month').toDate();

    const hours = await prisma.machineHour.findMany({
      where: {
        machineId: id,
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate totals
    const totals = hours.reduce((acc, hour) => {
      acc.totalWorked += hour.hoursWorked;
      acc.totalRequired += hour.requiredHours;
      acc.totalExtra += hour.extraHours;
      return acc;
    }, { totalWorked: 0, totalRequired: 0, totalExtra: 0 });

    // Calculate efficiency
    const efficiency = totals.totalRequired > 0 
      ? (totals.totalWorked / totals.totalRequired) * 100 
      : 0;

    res.json({
      hours,
      totals,
      efficiency: Math.round(efficiency * 100) / 100,
      period: { start, end }
    });
  } catch (error) {
    console.error('Get hours report error:', error);
    res.status(500).json({ error: 'Failed to get hours report' });
  }
});

// Get machine assignments
router.get('/:id/assignments', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const assignments = await prisma.machineAssignment.findMany({
      where: { machineId: id },
      include: {
        driver: true,
        assistant: true
      },
      orderBy: { startDate: 'desc' }
    });

    res.json({ assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to get assignments' });
  }
});

export default router;