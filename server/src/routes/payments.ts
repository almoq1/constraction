import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireManager, AuthRequest } from '../middleware/auth';
import moment from 'moment';

const router = Router();

// Get all payments
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { type, startDate, endDate, page = 1, limit = 20 } = req.query;

    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const payments = await prisma.payment.findMany({
      where,
      include: {
        contract: {
          select: {
            id: true,
            title: true,
            clientName: true
          }
        },
        landRental: {
          select: {
            id: true,
            tenantName: true,
            land: {
              select: {
                name: true
              }
            }
          }
        },
        roomRental: {
          select: {
            id: true,
            tenantName: true,
            room: {
              select: {
                name: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: parseInt(limit as string)
    });

    const total = await prisma.payment.count({ where });

    res.json({
      payments,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to get payments' });
  }
});

// Get payment by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        contract: true,
        landRental: {
          include: {
            land: true
          }
        },
        roomRental: {
          include: {
            room: true
          }
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

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to get payment' });
  }
});

// Create payment
router.post('/', [authenticateToken, requireManager], [
  body('amount').isFloat({ min: 0 }),
  body('type').isIn(['INCOME', 'EXPENSE', 'SALARY', 'RENT', 'CONTRACT']),
  body('date').isISO8601(),
  body('description').optional().trim(),
  body('contractId').optional().isString(),
  body('landRentalId').optional().isString(),
  body('roomRentalId').optional().isString()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      amount,
      type,
      date,
      description,
      contractId,
      landRentalId,
      roomRentalId
    } = req.body;

    // Validate that only one related entity is provided
    const relatedEntities = [contractId, landRentalId, roomRentalId].filter(Boolean);
    if (relatedEntities.length > 1) {
      return res.status(400).json({ 
        error: 'Payment can only be associated with one entity (contract, land rental, or room rental)' 
      });
    }

    const payment = await prisma.payment.create({
      data: {
        amount,
        type,
        date: new Date(date),
        description,
        contractId,
        landRentalId,
        roomRentalId,
        createdById: req.user!.id
      },
      include: {
        contract: true,
        landRental: {
          include: {
            land: true
          }
        },
        roomRental: {
          include: {
            room: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Payment created successfully',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Update payment
router.put('/:id', [authenticateToken, requireManager], [
  body('amount').optional().isFloat({ min: 0 }),
  body('type').optional().isIn(['INCOME', 'EXPENSE', 'SALARY', 'RENT', 'CONTRACT']),
  body('date').optional().isISO8601(),
  body('description').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        contract: true,
        landRental: {
          include: {
            land: true
          }
        },
        roomRental: {
          include: {
            room: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      message: 'Payment updated successfully',
      payment
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// Delete payment
router.delete('/:id', [authenticateToken, requireManager], async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.payment.delete({
      where: { id }
    });

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

// Get financial summary
router.get('/summary', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      select: {
        amount: true,
        type: true,
        date: true
      }
    });

    // Calculate totals by type
    const summary = payments.reduce((acc, payment) => {
      if (!acc[payment.type]) {
        acc[payment.type] = 0;
      }
      acc[payment.type] += payment.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate net income
    const income = summary['INCOME'] || 0;
    const expenses = summary['EXPENSE'] || 0;
    const netIncome = income - expenses;

    // Calculate total revenue
    const totalRevenue = Object.values(summary).reduce((sum, amount) => sum + amount, 0);

    res.json({
      summary,
      totals: {
        income,
        expenses,
        netIncome: Math.round(netIncome * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100
      },
      period: {
        startDate: startDate ? new Date(startDate as string) : moment().startOf('month').toDate(),
        endDate: endDate ? new Date(endDate as string) : moment().endOf('month').toDate()
      }
    });
  } catch (error) {
    console.error('Get financial summary error:', error);
    res.status(500).json({ error: 'Failed to get financial summary' });
  }
});

// Get salary payments
router.get('/salary', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, driverId, assistantId } = req.query;

    const where: any = {
      type: 'SALARY'
    };
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    if (driverId) {
      where.driverId = driverId;
    }

    if (assistantId) {
      where.assistantId = assistantId;
    }

    const salaryPayments = await prisma.salaryPayment.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        assistant: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    const totalSalary = salaryPayments.reduce((sum, payment) => sum + payment.amount, 0);

    res.json({
      salaryPayments,
      totalSalary: Math.round(totalSalary * 100) / 100
    });
  } catch (error) {
    console.error('Get salary payments error:', error);
    res.status(500).json({ error: 'Failed to get salary payments' });
  }
});

// Get payment statistics
router.get('/statistics', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { period = 'month' } = req.query;

    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'week':
        startDate = moment().startOf('week').toDate();
        endDate = moment().endOf('week').toDate();
        break;
      case 'month':
        startDate = moment().startOf('month').toDate();
        endDate = moment().endOf('month').toDate();
        break;
      case 'quarter':
        startDate = moment().startOf('quarter').toDate();
        endDate = moment().endOf('quarter').toDate();
        break;
      case 'year':
        startDate = moment().startOf('year').toDate();
        endDate = moment().endOf('year').toDate();
        break;
      default:
        startDate = moment().startOf('month').toDate();
        endDate = moment().endOf('month').toDate();
    }

    const payments = await prisma.payment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        amount: true,
        type: true,
        date: true
      }
    });

    // Group by type and calculate totals
    const typeStats = payments.reduce((acc, payment) => {
      if (!acc[payment.type]) {
        acc[payment.type] = {
          total: 0,
          count: 0,
          average: 0
        };
      }
      acc[payment.type].total += payment.amount;
      acc[payment.type].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number; average: number }>);

    // Calculate averages
    Object.keys(typeStats).forEach(type => {
      typeStats[type].average = typeStats[type].count > 0 
        ? typeStats[type].total / typeStats[type].count 
        : 0;
    });

    // Calculate overall statistics
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalCount = payments.length;
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    res.json({
      period: {
        startDate,
        endDate,
        type: period
      },
      statistics: {
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalCount,
        averageAmount: Math.round(averageAmount * 100) / 100
      },
      typeStats
    });
  } catch (error) {
    console.error('Get payment statistics error:', error);
    res.status(500).json({ error: 'Failed to get payment statistics' });
  }
});

export default router;