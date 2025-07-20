import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TenantRequest extends Request {
  company?: any;
  companyId?: string;
}

// Middleware to identify company from subdomain or custom domain
export const identifyCompany = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const host = req.get('host') || '';
    const subdomain = host.split('.')[0];
    
    // Check if it's a custom domain
    let company = await prisma.company.findFirst({
      where: {
        OR: [
          { domain: host },
          { subdomain: subdomain }
        ],
        isActive: true
      }
    });

    if (!company) {
      // Default to main platform or show company selection
      return res.status(404).json({ 
        error: 'Company not found',
        message: 'Please contact support to set up your company account'
      });
    }

    req.company = company;
    req.companyId = company.id;
    next();
  } catch (error) {
    console.error('Error identifying company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to ensure user belongs to the identified company
export const ensureCompanyAccess = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.companyId) {
      return res.status(400).json({ error: 'Company not identified' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user belongs to the company
    const user = await prisma.user.findFirst({
      where: {
        id: req.user.id,
        companyId: req.companyId,
        isActive: true
      }
    });

    if (!user) {
      return res.status(403).json({ error: 'Access denied to this company' });
    }

    next();
  } catch (error) {
    console.error('Error checking company access:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to filter data by company
export const filterByCompany = (req: TenantRequest, res: Response, next: NextFunction) => {
  if (!req.companyId) {
    return res.status(400).json({ error: 'Company not identified' });
  }

  // Add company filter to query
  req.query.companyId = req.companyId;
  next();
};