import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get basic system stats
    const [
      totalCompanies,
      totalUsers,
      totalPayments,
      activeCompanies
    ] = await Promise.all([
      prisma.company.count(),
      prisma.user.count(),
      prisma.companySubscriptionPayment.count(),
      prisma.company.count({ where: { isActive: true } })
    ]);

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      system: {
        totalCompanies,
        totalUsers,
        totalPayments,
        activeCompanies
      },
      version: '1.0.0',
      features: {
        multiTenant: true,
        superAdmin: true,
        paymentManagement: true,
        subscriptionPlans: true,
        customLandingPages: true
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      uptime: process.uptime()
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const checks = {
      database: false,
      prisma: false,
      superAdmin: false,
      subscriptionPlans: false,
      companies: false
    };

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      console.error('Database check failed:', error);
    }

    // Check Prisma client
    try {
      await prisma.$connect();
      checks.prisma = true;
    } catch (error) {
      console.error('Prisma check failed:', error);
    }

    // Check super admin exists
    try {
      const superAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' }
      });
      checks.superAdmin = !!superAdmin;
    } catch (error) {
      console.error('Super admin check failed:', error);
    }

    // Check subscription plans exist
    try {
      const plans = await prisma.subscriptionPlan.count();
      checks.subscriptionPlans = plans > 0;
    } catch (error) {
      console.error('Subscription plans check failed:', error);
    }

    // Check companies exist
    try {
      const companies = await prisma.company.count();
      checks.companies = companies >= 0;
    } catch (error) {
      console.error('Companies check failed:', error);
    }

    const allChecksPassed = Object.values(checks).every(check => check);

    res.json({
      status: allChecksPassed ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      uptime: process.uptime()
    });
  }
});

export default router;