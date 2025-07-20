import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/superAdmin';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// ==================== PAYMENT OVERVIEW ====================

// Get payment overview and statistics
router.get('/overview', [authenticateToken, requireSuperAdmin], async (req: AuthRequest, res) => {
  try {
    const [
      totalPayments,
      totalAmount,
      pendingPayments,
      overduePayments,
      monthlyRevenue,
      paymentMethodsStats,
      recentPayments,
      upcomingPayments
    ] = await Promise.all([
      prisma.companySubscriptionPayment.count(),
      prisma.companySubscriptionPayment.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { amount: true }
      }),
      prisma.companySubscriptionPayment.count({
        where: { paymentStatus: 'PENDING' }
      }),
      prisma.companySubscriptionPayment.count({
        where: { paymentStatus: 'OVERDUE' }
      }),
      prisma.companySubscriptionPayment.aggregate({
        where: {
          paymentStatus: 'PAID',
          paidDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amount: true }
      }),
      prisma.companySubscriptionPayment.groupBy({
        by: ['paymentMethod'],
        where: { paymentStatus: 'PAID' },
        _sum: { amount: true },
        _count: { paymentMethod: true }
      }),
      prisma.companySubscriptionPayment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          subscriptionPlan: {
            select: {
              id: true,
              name: true,
              price: true
            }
          }
        }
      }),
      prisma.companySubscriptionPayment.findMany({
        where: {
          paymentStatus: 'PENDING',
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
          }
        },
        orderBy: { dueDate: 'asc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          subscriptionPlan: {
            select: {
              id: true,
              name: true,
              price: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalPayments,
        totalAmount: totalAmount._sum.amount || 0,
        pendingPayments,
        overduePayments,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        paymentMethodsStats,
        recentPayments,
        upcomingPayments
      }
    });
  } catch (error) {
    console.error('Get payment overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PAYMENT MANAGEMENT ====================

// Get all subscription payments
router.get('/payments', [authenticateToken, requireSuperAdmin], async (req: AuthRequest, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      method = '', 
      companyId = '',
      startDate = '',
      endDate = ''
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { company: { name: { contains: search as string, mode: 'insensitive' } } },
        { transactionId: { contains: search as string, mode: 'insensitive' } },
        { receiptNumber: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.paymentStatus = status;
    }

    if (method) {
      where.paymentMethod = method;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (startDate && endDate) {
      where.dueDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const [payments, total] = await Promise.all([
      prisma.companySubscriptionPayment.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              email: true
            }
          },
          subscriptionPlan: {
            select: {
              id: true,
              name: true,
              price: true,
              billingCycle: true
            }
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
      }),
      prisma.companySubscriptionPayment.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single payment
router.get('/payments/:id', [authenticateToken, requireSuperAdmin], async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.companySubscriptionPayment.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            email: true,
            phone: true,
            address: true
          }
        },
        subscriptionPlan: {
          select: {
            id: true,
            name: true,
            price: true,
            billingCycle: true,
            features: true
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

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create payment record
router.post('/payments', [authenticateToken, requireSuperAdmin], [
  body('companyId').notEmpty(),
  body('subscriptionPlanId').notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('paymentMethod').isIn(['CASH', 'BANK_TRANSFER', 'HESABPAY', 'CREDIT_CARD', 'DEBIT_CARD']),
  body('billingCycle').isIn(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  body('billingPeriod').notEmpty(),
  body('dueDate').isISO8601(),
  body('transactionId').optional().trim(),
  body('receiptNumber').optional().trim(),
  body('notes').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      companyId,
      subscriptionPlanId,
      amount,
      paymentMethod,
      billingCycle,
      billingPeriod,
      dueDate,
      transactionId,
      receiptNumber,
      notes
    } = req.body;

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if subscription plan exists
    const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: subscriptionPlanId }
    });

    if (!subscriptionPlan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    // Create payment record
    const payment = await prisma.companySubscriptionPayment.create({
      data: {
        companyId,
        subscriptionPlanId,
        amount,
        paymentMethod,
        paymentStatus: 'PENDING',
        billingCycle,
        billingPeriod,
        dueDate: new Date(dueDate),
        transactionId,
        receiptNumber,
        notes,
        createdById: req.user!.id
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        subscriptionPlan: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment record created successfully',
      data: payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update payment status
router.put('/payments/:id/status', [authenticateToken, requireSuperAdmin], [
  body('paymentStatus').isIn(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'FAILED']),
  body('paidDate').optional().isISO8601(),
  body('transactionId').optional().trim(),
  body('receiptNumber').optional().trim(),
  body('notes').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      paymentStatus,
      paidDate,
      transactionId,
      receiptNumber,
      notes
    } = req.body;

    // Check if payment exists
    const existingPayment = await prisma.companySubscriptionPayment.findUnique({
      where: { id }
    });

    if (!existingPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment
    const updateData: any = {
      paymentStatus,
      notes: notes || existingPayment.notes
    };

    if (paymentStatus === 'PAID' && paidDate) {
      updateData.paidDate = new Date(paidDate);
    }

    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    if (receiptNumber) {
      updateData.receiptNumber = receiptNumber;
    }

    const payment = await prisma.companySubscriptionPayment.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        subscriptionPlan: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: payment
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete payment
router.delete('/payments/:id', [authenticateToken, requireSuperAdmin], async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if payment exists
    const payment = await prisma.companySubscriptionPayment.findUnique({
      where: { id }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Only allow deletion of pending payments
    if (payment.paymentStatus !== 'PENDING') {
      return res.status(400).json({ error: 'Only pending payments can be deleted' });
    }

    // Delete payment
    await prisma.companySubscriptionPayment.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== BILLING MANAGEMENT ====================

// Generate monthly bills for all companies
router.post('/generate-bills', [authenticateToken, requireSuperAdmin], [
  body('billingPeriod').notEmpty(), // e.g., "2024-01"
  body('dueDate').isISO8601()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { billingPeriod, dueDate } = req.body;

    // Get all active companies
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      include: {
        subscriptionPlan: true
      }
    });

    const generatedBills = [];

    for (const company of companies) {
      // Check if bill already exists for this period
      const existingBill = await prisma.companySubscriptionPayment.findFirst({
        where: {
          companyId: company.id,
          billingPeriod
        }
      });

      if (!existingBill) {
        // Create new bill
        const bill = await prisma.companySubscriptionPayment.create({
          data: {
            companyId: company.id,
            subscriptionPlanId: company.subscriptionPlan,
            amount: company.subscriptionPlan === 'FREE' ? 0 : 50, // Default price for non-free plans
            paymentMethod: 'BANK_TRANSFER', // Default method
            paymentStatus: 'PENDING',
            billingCycle: 'MONTHLY',
            billingPeriod,
            dueDate: new Date(dueDate),
            createdById: req.user!.id
          }
        });

        generatedBills.push(bill);
      }
    }

    res.json({
      success: true,
      message: `${generatedBills.length} bills generated successfully`,
      data: {
        generatedBills,
        totalCompanies: companies.length
      }
    });
  } catch (error) {
    console.error('Generate bills error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get overdue payments
router.get('/overdue', [authenticateToken, requireSuperAdmin], async (req: AuthRequest, res) => {
  try {
    const overduePayments = await prisma.companySubscriptionPayment.findMany({
      where: {
        paymentStatus: 'PENDING',
        dueDate: {
          lt: new Date()
        }
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            email: true,
            phone: true
          }
        },
        subscriptionPlan: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json({
      success: true,
      data: overduePayments
    });
  } catch (error) {
    console.error('Get overdue payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PAYMENT REPORTS ====================

// Get payment reports
router.get('/reports', [authenticateToken, requireSuperAdmin], async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    const where: any = {};
    
    if (startDate && endDate) {
      where.paidDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    // Get payment statistics
    const [
      totalRevenue,
      paymentMethodStats,
      monthlyStats,
      companyStats
    ] = await Promise.all([
      prisma.companySubscriptionPayment.aggregate({
        where: { ...where, paymentStatus: 'PAID' },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.companySubscriptionPayment.groupBy({
        by: ['paymentMethod'],
        where: { ...where, paymentStatus: 'PAID' },
        _sum: { amount: true },
        _count: { paymentMethod: true }
      }),
      prisma.companySubscriptionPayment.groupBy({
        by: ['billingPeriod'],
        where: { ...where, paymentStatus: 'PAID' },
        _sum: { amount: true },
        _count: { billingPeriod: true }
      }),
      prisma.companySubscriptionPayment.groupBy({
        by: ['companyId'],
        where: { ...where, paymentStatus: 'PAID' },
        _sum: { amount: true },
        _count: { companyId: true }
      })
    ]);

    // Get company details for company stats
    const companyDetails = await Promise.all(
      companyStats.map(async (stat) => {
        const company = await prisma.company.findUnique({
          where: { id: stat.companyId },
          select: { name: true, slug: true }
        });
        return {
          ...stat,
          company
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalPayments: totalRevenue._count.id || 0,
        paymentMethodStats,
        monthlyStats,
        companyStats: companyDetails
      }
    });
  } catch (error) {
    console.error('Get payment reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;