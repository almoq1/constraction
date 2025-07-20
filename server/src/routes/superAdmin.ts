import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/superAdmin';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// ==================== SUPER ADMIN AUTHENTICATION ====================

// Super admin login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find super admin user (no company association)
    const user = await prisma.user.findFirst({
      where: {
        email,
        role: 'SUPER_ADMIN',
        companyId: null,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        isSuperAdmin: true
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
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Super admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PLATFORM OVERVIEW ====================

// Get platform overview
router.get('/overview', [authenticateToken, requireSuperAdmin], async (req: AuthRequest, res) => {
  try {
    const [
      totalCompanies,
      activeCompanies,
      totalUsers,
      totalMachines,
      totalDrivers,
      totalContracts,
      recentCompanies,
      subscriptionStats
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: { not: 'SUPER_ADMIN' } } }),
      prisma.machine.count(),
      prisma.driver.count(),
      prisma.contract.count(),
      prisma.company.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              machines: true,
              drivers: true,
              contracts: true
            }
          }
        }
      }),
      prisma.company.groupBy({
        by: ['subscriptionPlan'],
        _count: {
          subscriptionPlan: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalCompanies,
        activeCompanies,
        totalUsers,
        totalMachines,
        totalDrivers,
        totalContracts,
        recentCompanies,
        subscriptionStats
      }
    });
  } catch (error) {
    console.error('Get platform overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== COMPANY MANAGEMENT ====================

// Get all companies
router.get('/companies', [authenticateToken, requireSuperAdmin], async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          _count: {
            select: {
              users: true,
              machines: true,
              drivers: true,
              contracts: true
            }
          },
          settings: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.company.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        companies,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single company
router.get('/companies/:id', [authenticateToken, requireSuperAdmin], async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          orderBy: { createdAt: 'desc' }
        },
        settings: true,
        landingPage: true,
        _count: {
          select: {
            users: true,
            machines: true,
            drivers: true,
            contracts: true,
            lands: true,
            rooms: true
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create company
router.post('/companies', [authenticateToken, requireSuperAdmin], [
  body('name').notEmpty().trim(),
  body('slug').notEmpty().trim().isAlphanumeric(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('adminName').notEmpty().trim(),
  body('adminEmail').isEmail().normalizeEmail(),
  body('adminPassword').isLength({ min: 6 }),
  body('subscriptionPlan').optional().isIn(['FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE']),
  body('maxUsers').optional().isInt({ min: 1 }),
  body('maxMachines').optional().isInt({ min: 1 }),
  body('maxDrivers').optional().isInt({ min: 1 }),
  body('maxContracts').optional().isInt({ min: 1 })
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      slug,
      email,
      phone,
      address,
      adminName,
      adminEmail,
      adminPassword,
      subscriptionPlan = 'FREE',
      maxUsers,
      maxMachines,
      maxDrivers,
      maxContracts
    } = req.body;

    // Check if company slug already exists
    const existingCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { slug },
          { email },
          { subdomain: slug }
        ]
      }
    });

    if (existingCompany) {
      return res.status(400).json({ 
        error: 'Company with this slug, email, or subdomain already exists' 
      });
    }

    // Check if admin email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: adminEmail }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Admin email already exists' });
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        slug,
        email,
        phone,
        address,
        subdomain: slug,
        subscriptionPlan,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        maxUsers: maxUsers || (subscriptionPlan === 'FREE' ? 5 : subscriptionPlan === 'BASIC' ? 10 : subscriptionPlan === 'PROFESSIONAL' ? 25 : 100),
        maxMachines: maxMachines || (subscriptionPlan === 'FREE' ? 10 : subscriptionPlan === 'BASIC' ? 25 : subscriptionPlan === 'PROFESSIONAL' ? 50 : 200),
        maxDrivers: maxDrivers || (subscriptionPlan === 'FREE' ? 5 : subscriptionPlan === 'BASIC' ? 10 : subscriptionPlan === 'PROFESSIONAL' ? 25 : 100),
        maxContracts: maxContracts || (subscriptionPlan === 'FREE' ? 10 : subscriptionPlan === 'BASIC' ? 25 : subscriptionPlan === 'PROFESSIONAL' ? 50 : 200)
      }
    });

    // Create company settings
    await prisma.companySettings.create({
      data: {
        companyId: company.id
      }
    });

    // Create landing page
    await prisma.landingPage.create({
      data: {
        companyId: company.id,
        title: `Welcome to ${name}`,
        subtitle: 'Professional construction and equipment rental services'
      }
    });

    // Hash admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'ADMIN',
        companyId: company.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: {
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          subdomain: company.subdomain,
          subscriptionPlan: company.subscriptionPlan
        },
        admin: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role
        }
      }
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update company
router.put('/companies/:id', [authenticateToken, requireSuperAdmin], [
  body('name').optional().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('logo').optional().trim(),
  body('favicon').optional().trim(),
  body('primaryColor').optional().trim(),
  body('secondaryColor').optional().trim(),
  body('accentColor').optional().trim(),
  body('isActive').optional().isBoolean(),
  body('isVerified').optional().isBoolean(),
  body('subscriptionPlan').optional().isIn(['FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE']),
  body('maxUsers').optional().isInt({ min: 1 }),
  body('maxMachines').optional().isInt({ min: 1 }),
  body('maxDrivers').optional().isInt({ min: 1 }),
  body('maxContracts').optional().isInt({ min: 1 })
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const company = await prisma.company.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: company
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete company
router.delete('/companies/:id', [authenticateToken, requireSuperAdmin], async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Delete company (cascade will handle related data)
    await prisma.company.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== USER MANAGEMENT ====================

// Get all users across all companies
router.get('/users', [authenticateToken, requireSuperAdmin], async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', companyId = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      role: { not: 'SUPER_ADMIN' }
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user for a company
router.post('/users', [authenticateToken, requireSuperAdmin], [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['ADMIN', 'MANAGER', 'USER']),
  body('companyId').notEmpty(),
  body('language').optional().isIn(['ENGLISH', 'DARI', 'PASHTO'])
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, companyId, language = 'ENGLISH' } = req.body;

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if user email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        companyId,
        language
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/users/:id', [authenticateToken, requireSuperAdmin], [
  body('name').optional().notEmpty().trim(),
  body('role').optional().isIn(['ADMIN', 'MANAGER', 'USER']),
  body('isActive').optional().isBoolean(),
  body('language').optional().isIn(['ENGLISH', 'DARI', 'PASHTO'])
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', [authenticateToken, requireSuperAdmin], async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deletion of super admins
    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Cannot delete super admin users' });
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SUBSCRIPTION MANAGEMENT ====================

// Get all subscription plans
router.get('/subscription-plans', [authenticateToken, requireSuperAdmin], async (req: AuthRequest, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    });

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create subscription plan
router.post('/subscription-plans', [authenticateToken, requireSuperAdmin], [
  body('name').notEmpty().trim(),
  body('slug').notEmpty().trim(),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }),
  body('billingCycle').isIn(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  body('maxUsers').isInt({ min: 1 }),
  body('maxMachines').isInt({ min: 1 }),
  body('maxDrivers').isInt({ min: 1 }),
  body('maxContracts').isInt({ min: 1 }),
  body('features').isArray(),
  body('isActive').optional().isBoolean()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const plan = await prisma.subscriptionPlan.create({
      data: req.body
    });

    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      data: plan
    });
  } catch (error) {
    console.error('Create subscription plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update subscription plan
router.put('/subscription-plans/:id', [authenticateToken, requireSuperAdmin], [
  body('name').optional().notEmpty().trim(),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('billingCycle').optional().isIn(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  body('maxUsers').optional().isInt({ min: 1 }),
  body('maxMachines').optional().isInt({ min: 1 }),
  body('maxDrivers').optional().isInt({ min: 1 }),
  body('maxContracts').optional().isInt({ min: 1 }),
  body('features').optional().isArray(),
  body('isActive').optional().isBoolean()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: req.body
    });

    res.json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan
    });
  } catch (error) {
    console.error('Update subscription plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SYSTEM SETTINGS ====================

// Get system settings
router.get('/settings', [authenticateToken, requireSuperAdmin], async (req: AuthRequest, res) => {
  try {
    // This could be expanded to include system-wide settings
    const settings = {
      platformName: 'Construction SaaS Platform',
      version: '1.0.0',
      maintenanceMode: false,
      registrationEnabled: true,
      defaultSubscriptionPlan: 'FREE',
      maxCompanies: 1000,
      maxUsersPerCompany: 100,
      backupFrequency: 'daily',
      retentionDays: 30
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update system settings
router.put('/settings', [authenticateToken, requireSuperAdmin], [
  body('maintenanceMode').optional().isBoolean(),
  body('registrationEnabled').optional().isBoolean(),
  body('defaultSubscriptionPlan').optional().isIn(['FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE'])
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // In a real implementation, these would be stored in a settings table
    res.json({
      success: true,
      message: 'System settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;