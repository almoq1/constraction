import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { identifyCompany, TenantRequest } from '../middleware/tenant';

const router = express.Router();
const prisma = new PrismaClient();

// ==================== COMPANY REGISTRATION ====================

// Register new company
router.post('/register', [
  body('name').notEmpty().trim(),
  body('slug').notEmpty().trim().isAlphanumeric(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('adminName').notEmpty().trim(),
  body('adminEmail').isEmail().normalizeEmail(),
  body('adminPassword').isLength({ min: 6 }),
  body('subscriptionPlan').optional().isIn(['FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE'])
], async (req, res) => {
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
      subscriptionPlan = 'FREE'
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
        maxUsers: subscriptionPlan === 'FREE' ? 5 : subscriptionPlan === 'BASIC' ? 10 : subscriptionPlan === 'PROFESSIONAL' ? 25 : 100,
        maxMachines: subscriptionPlan === 'FREE' ? 10 : subscriptionPlan === 'BASIC' ? 25 : subscriptionPlan === 'PROFESSIONAL' ? 50 : 200,
        maxDrivers: subscriptionPlan === 'FREE' ? 5 : subscriptionPlan === 'BASIC' ? 10 : subscriptionPlan === 'PROFESSIONAL' ? 25 : 100,
        maxContracts: subscriptionPlan === 'FREE' ? 10 : subscriptionPlan === 'BASIC' ? 25 : subscriptionPlan === 'PROFESSIONAL' ? 50 : 200
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

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: adminUser.id, 
        role: adminUser.role,
        companyId: company.id
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Company registered successfully',
      data: {
        token,
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          subdomain: company.subdomain,
          subscriptionPlan: company.subscriptionPlan
        },
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role
        }
      }
    });
  } catch (error) {
    console.error('Company registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== COMPANY LOGIN ====================

// Company login
router.post('/login', [
  body('subdomain').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subdomain, email, password } = req.body;

    // Find company
    const company = await prisma.company.findFirst({
      where: {
        OR: [
          { subdomain },
          { slug: subdomain }
        ],
        isActive: true
      }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Find user in this company
    const user = await prisma.user.findFirst({
      where: {
        email,
        companyId: company.id,
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
        companyId: company.id
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          subdomain: company.subdomain,
          subscriptionPlan: company.subscriptionPlan
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Company login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== COMPANY MANAGEMENT ====================

// Get company profile
router.get('/profile', [authenticateToken, identifyCompany], async (req: TenantRequest, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.companyId },
      include: {
        settings: true,
        landingPage: true,
        _count: {
          select: {
            users: true,
            machines: true,
            drivers: true,
            contracts: true
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
    console.error('Get company profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update company profile
router.put('/profile', [authenticateToken, identifyCompany], [
  body('name').optional().notEmpty().trim(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('logo').optional().trim(),
  body('favicon').optional().trim(),
  body('primaryColor').optional().trim(),
  body('secondaryColor').optional().trim(),
  body('accentColor').optional().trim()
], async (req: TenantRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const company = await prisma.company.update({
      where: { id: req.companyId },
      data: req.body
    });

    res.json({
      success: true,
      message: 'Company profile updated successfully',
      data: company
    });
  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== LANDING PAGE MANAGEMENT ====================

// Get landing page
router.get('/landing-page', [identifyCompany], async (req: TenantRequest, res) => {
  try {
    const landingPage = await prisma.landingPage.findUnique({
      where: { companyId: req.companyId }
    });

    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    res.json({
      success: true,
      data: landingPage
    });
  } catch (error) {
    console.error('Get landing page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update landing page
router.put('/landing-page', [authenticateToken, identifyCompany], [
  body('title').optional().trim(),
  body('subtitle').optional().trim(),
  body('heroImage').optional().trim(),
  body('heroVideo').optional().trim(),
  body('aboutTitle').optional().trim(),
  body('aboutContent').optional().trim(),
  body('aboutImage').optional().trim(),
  body('services').optional().isJSON(),
  body('testimonials').optional().isJSON(),
  body('contactEmail').optional().isEmail(),
  body('contactPhone').optional().trim(),
  body('contactAddress').optional().trim(),
  body('socialLinks').optional().isJSON(),
  body('footerText').optional().trim(),
  body('customCSS').optional().trim(),
  body('customJS').optional().trim(),
  body('isPublished').optional().isBoolean()
], async (req: TenantRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { ...req.body };
    
    // Parse JSON fields
    if (req.body.services) {
      updateData.services = JSON.parse(req.body.services);
    }
    if (req.body.testimonials) {
      updateData.testimonials = JSON.parse(req.body.testimonials);
    }
    if (req.body.socialLinks) {
      updateData.socialLinks = JSON.parse(req.body.socialLinks);
    }

    const landingPage = await prisma.landingPage.update({
      where: { companyId: req.companyId },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Landing page updated successfully',
      data: landingPage
    });
  } catch (error) {
    console.error('Update landing page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== COMPANY SETTINGS ====================

// Get company settings
router.get('/settings', [authenticateToken, identifyCompany], async (req: TenantRequest, res) => {
  try {
    const settings = await prisma.companySettings.findUnique({
      where: { companyId: req.companyId }
    });

    if (!settings) {
      return res.status(404).json({ error: 'Company settings not found' });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get company settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update company settings
router.put('/settings', [authenticateToken, identifyCompany], [
  body('timezone').optional().trim(),
  body('currency').optional().trim(),
  body('dateFormat').optional().trim(),
  body('timeFormat').optional().trim(),
  body('language').optional().isIn(['ENGLISH', 'DARI', 'PASHTO']),
  body('enableNotifications').optional().isBoolean(),
  body('enableEmailAlerts').optional().isBoolean(),
  body('enableSMSAlerts').optional().isBoolean(),
  body('autoBackup').optional().isBoolean(),
  body('backupFrequency').optional().trim(),
  body('retentionDays').optional().isInt({ min: 1, max: 365 }),
  body('customFields').optional().isJSON()
], async (req: TenantRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { ...req.body };
    
    if (req.body.customFields) {
      updateData.customFields = JSON.parse(req.body.customFields);
    }

    const settings = await prisma.companySettings.update({
      where: { companyId: req.companyId },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Company settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update company settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SUBSCRIPTION MANAGEMENT ====================

// Get subscription plans
router.get('/subscription-plans', async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
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

// Get current subscription
router.get('/subscription', [authenticateToken, identifyCompany], async (req: TenantRequest, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.companyId },
      select: {
        subscriptionPlan: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        maxUsers: true,
        maxMachines: true,
        maxDrivers: true,
        maxContracts: true,
        _count: {
          select: {
            users: true,
            machines: true,
            drivers: true,
            contracts: true
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
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;