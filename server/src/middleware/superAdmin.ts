import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from './auth';

const prisma = new PrismaClient();

// Middleware to ensure user is a super admin
export const requireSuperAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user is a super admin
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    next();
  } catch (error) {
    console.error('Super admin middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to check if user is super admin (optional)
export const isSuperAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      req.isSuperAdmin = false;
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    req.isSuperAdmin = user?.role === 'SUPER_ADMIN';
    next();
  } catch (error) {
    console.error('Super admin check error:', error);
    req.isSuperAdmin = false;
    next();
  }
};

// Extend AuthRequest interface
declare global {
  namespace Express {
    interface Request {
      isSuperAdmin?: boolean;
    }
  }
}