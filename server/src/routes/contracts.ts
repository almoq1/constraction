import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireManager, AuthRequest } from '../middleware/auth';
import moment from 'moment';

const router = Router();

// Get all contracts
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        contractMachines: {
          include: {
            machine: true
          }
        },
        payments: {
          orderBy: { date: 'desc' }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ contracts });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ error: 'Failed to get contracts' });
  }
});

// Get single contract
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        contractMachines: {
          include: {
            machine: {
              include: {
                machineHours: {
                  where: {
                    date: {
                      gte: new Date()
                    }
                  },
                  orderBy: { date: 'desc' }
                }
              }
            }
          }
        },
        payments: {
          orderBy: { date: 'desc' }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json({ contract });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ error: 'Failed to get contract' });
  }
});

// Create contract
router.post('/', [authenticateToken, requireManager], [
  body('title').notEmpty().trim(),
  body('clientName').notEmpty().trim(),
  body('clientPhone').notEmpty().trim(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('totalAmount').isFloat({ min: 0 }),
  body('description').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      clientName,
      clientPhone,
      startDate,
      endDate,
      totalAmount,
      description
    } = req.body;

    const contract = await prisma.contract.create({
      data: {
        title,
        clientName,
        clientPhone,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalAmount,
        description,
        createdById: req.user!.id
      }
    });

    res.status(201).json({
      message: 'Contract created successfully',
      contract
    });
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// Update contract
router.put('/:id', [authenticateToken, requireManager], [
  body('title').optional().notEmpty().trim(),
  body('clientName').optional().notEmpty().trim(),
  body('clientPhone').optional().notEmpty().trim(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('totalAmount').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('status').optional().isIn(['ACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED'])
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects if provided
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const contract = await prisma.contract.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Contract updated successfully',
      contract
    });
  } catch (error) {
    console.error('Update contract error:', error);
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

// Delete contract
router.delete('/:id', [authenticateToken, requireManager], async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if contract has payments
    const payments = await prisma.payment.findFirst({
      where: { contractId: id }
    });

    if (payments) {
      return res.status(400).json({ 
        error: 'Cannot delete contract that has payments' 
      });
    }

    // Delete contract machines first
    await prisma.contractMachine.deleteMany({
      where: { contractId: id }
    });

    // Delete contract
    await prisma.contract.delete({
      where: { id }
    });

    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Delete contract error:', error);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

// Assign machine to contract
router.post('/:id/assign-machine', [authenticateToken, requireManager], [
  body('machineId').notEmpty().trim(),
  body('requiredHoursPerDay').isInt({ min: 1, max: 24 }),
  body('dailyRate').isFloat({ min: 0 })
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { machineId, requiredHoursPerDay, dailyRate } = req.body;

    // Check if contract exists
    const contract = await prisma.contract.findUnique({
      where: { id }
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check if machine exists
    const machine = await prisma.machine.findUnique({
      where: { id: machineId }
    });

    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    // Check if machine is already assigned to this contract
    const existingAssignment = await prisma.contractMachine.findFirst({
      where: {
        contractId: id,
        machineId
      }
    });

    if (existingAssignment) {
      return res.status(400).json({ error: 'Machine is already assigned to this contract' });
    }

    // Calculate total hours per month (30 days)
    const totalHoursPerMonth = requiredHoursPerDay * 30;

    const contractMachine = await prisma.contractMachine.create({
      data: {
        contractId: id,
        machineId,
        requiredHoursPerDay,
        totalHoursPerMonth,
        dailyRate
      },
      include: {
        machine: true,
        contract: true
      }
    });

    res.status(201).json({
      message: 'Machine assigned to contract successfully',
      contractMachine
    });
  } catch (error) {
    console.error('Assign machine to contract error:', error);
    res.status(500).json({ error: 'Failed to assign machine to contract' });
  }
});

// Remove machine from contract
router.delete('/:id/machines/:machineId', [authenticateToken, requireManager], async (req: AuthRequest, res) => {
  try {
    const { id, machineId } = req.params;

    const contractMachine = await prisma.contractMachine.findFirst({
      where: {
        contractId: id,
        machineId
      }
    });

    if (!contractMachine) {
      return res.status(404).json({ error: 'Machine assignment not found' });
    }

    await prisma.contractMachine.delete({
      where: { id: contractMachine.id }
    });

    res.json({ message: 'Machine removed from contract successfully' });
  } catch (error) {
    console.error('Remove machine from contract error:', error);
    res.status(500).json({ error: 'Failed to remove machine from contract' });
  }
});

// Get contract financial summary
router.get('/:id/financial-summary', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        contractMachines: {
          include: {
            machine: true
          }
        },
        payments: {
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Calculate total received
    const totalReceived = contract.payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate remaining amount
    const remainingAmount = contract.totalAmount - totalReceived;

    // Calculate payment percentage
    const paymentPercentage = contract.totalAmount > 0 
      ? (totalReceived / contract.totalAmount) * 100 
      : 0;

    // Calculate contract duration
    const startDate = moment(contract.startDate);
    const endDate = moment(contract.endDate);
    const duration = endDate.diff(startDate, 'days');

    // Calculate daily rate for all machines
    const totalDailyRate = contract.contractMachines.reduce((sum, cm) => sum + cm.dailyRate, 0);

    res.json({
      contract,
      summary: {
        totalAmount: contract.totalAmount,
        totalReceived: Math.round(totalReceived * 100) / 100,
        remainingAmount: Math.round(remainingAmount * 100) / 100,
        paymentPercentage: Math.round(paymentPercentage * 100) / 100,
        duration,
        totalDailyRate: Math.round(totalDailyRate * 100) / 100,
        machineCount: contract.contractMachines.length
      },
      payments: contract.payments
    });
  } catch (error) {
    console.error('Get financial summary error:', error);
    res.status(500).json({ error: 'Failed to get financial summary' });
  }
});

// Record contract payment
router.post('/:id/payment', [authenticateToken, requireManager], [
  body('amount').isFloat({ min: 0 }),
  body('type').isIn(['CONTRACT']),
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

    // Check if contract exists
    const contract = await prisma.contract.findUnique({
      where: { id }
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const payment = await prisma.payment.create({
      data: {
        contractId: id,
        amount,
        type,
        date: new Date(date),
        description,
        createdById: req.user!.id
      },
      include: {
        contract: true
      }
    });

    res.status(201).json({
      message: 'Contract payment recorded successfully',
      payment
    });
  } catch (error) {
    console.error('Record contract payment error:', error);
    res.status(500).json({ error: 'Failed to record contract payment' });
  }
});

// Get contract machine hours report
router.get('/:id/machines/:machineId/hours-report', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id, machineId } = req.params;
    const { startDate, endDate } = req.query;

    const contractMachine = await prisma.contractMachine.findFirst({
      where: {
        contractId: id,
        machineId
      },
      include: {
        contract: true,
        machine: true
      }
    });

    if (!contractMachine) {
      return res.status(404).json({ error: 'Contract machine not found' });
    }

    const start = startDate ? new Date(startDate as string) : moment().startOf('month').toDate();
    const end = endDate ? new Date(endDate as string) : moment().endOf('month').toDate();

    const hours = await prisma.machineHour.findMany({
      where: {
        machineId,
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

    // Calculate revenue
    const totalRevenue = totals.totalWorked * contractMachine.machine.hourlyRate;

    res.json({
      contractMachine,
      hours,
      totals,
      efficiency: Math.round(efficiency * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      period: { start, end }
    });
  } catch (error) {
    console.error('Get hours report error:', error);
    res.status(500).json({ error: 'Failed to get hours report' });
  }
});

export default router;