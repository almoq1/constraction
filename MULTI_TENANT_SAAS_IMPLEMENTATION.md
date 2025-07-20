# Multi-Tenant Construction SaaS Platform Implementation

## Overview

This document describes the implementation of a comprehensive multi-tenant SaaS platform for construction companies. The platform allows each construction company to have their own isolated environment with customizable landing pages and separate data management.

## Architecture

### Multi-Tenant Design

The platform implements a **database-per-tenant** approach where each company has:
- Isolated database schema
- Customizable landing page
- Company-specific settings
- Role-based access control
- Subscription plan management

### Key Components

1. **Company Management System**
2. **Customizable Landing Pages**
3. **Subscription Plans**
4. **Multi-tenant Middleware**
5. **User Account System**

## Database Schema

### New Models Added

#### Company Model
```prisma
model Company {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  domain            String?  @unique
  subdomain         String?  @unique
  email             String   @unique
  phone             String?
  address           String?
  logo              String?
  favicon           String?
  primaryColor      String   @default("#1976d2")
  secondaryColor    String   @default("#dc004e")
  accentColor       String   @default("#ff9800")
  isActive          Boolean  @default(true)
  isVerified        Boolean  @default(false)
  subscriptionPlan  SubscriptionPlan @default(FREE)
  subscriptionStart DateTime?
  subscriptionEnd   DateTime?
  maxUsers          Int      @default(5)
  maxMachines       Int      @default(10)
  maxDrivers        Int      @default(5)
  maxContracts      Int      @default(10)
  databaseUrl       String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  users             User[]
  landingPage       LandingPage?
  settings          CompanySettings?
  lands             Land[]
  rooms             Room[]
  machines          Machine[]
  drivers           Driver[]
  driverAssistants  DriverAssistant[]
  contracts         Contract[]
}
```

#### Landing Page Model
```prisma
model LandingPage {
  id                    String   @id @default(cuid())
  companyId             String   @unique
  title                 String   @default("Welcome to Our Construction Services")
  subtitle              String?
  heroImage             String?
  heroVideo             String?
  aboutTitle            String   @default("About Us")
  aboutContent          String?
  aboutImage            String?
  services              Json?
  testimonials          Json?
  contactEmail          String?
  contactPhone          String?
  contactAddress        String?
  socialLinks           Json?
  footerText            String?
  customCSS             String?
  customJS              String?
  isPublished           Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  company               Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
}
```

#### Subscription Plan Model
```prisma
model SubscriptionPlan {
  id                    String   @id @default(cuid())
  name                  String   @unique
  slug                  String   @unique
  description           String?
  price                 Float
  billingCycle          BillingCycle @default(MONTHLY)
  maxUsers              Int
  maxMachines           Int
  maxDrivers            Int
  maxContracts          Int
  features              Json
  isActive              Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

## API Endpoints

### Company Management

#### Register New Company
```
POST /api/companies/register
```
Creates a new company with admin user and initial setup.

**Request Body:**
```json
{
  "name": "Ahmed Construction Co.",
  "slug": "ahmed-construction",
  "email": "info@ahmedconstruction.com",
  "phone": "+93 123 456 789",
  "address": "Kabul, Afghanistan",
  "adminName": "Ahmed Khan",
  "adminEmail": "ahmed@ahmedconstruction.com",
  "adminPassword": "securepassword123",
  "subscriptionPlan": "FREE"
}
```

#### Company Login
```
POST /api/companies/login
```
Authenticates user for a specific company.

**Request Body:**
```json
{
  "subdomain": "ahmed-construction",
  "email": "ahmed@ahmedconstruction.com",
  "password": "securepassword123"
}
```

#### Get Company Profile
```
GET /api/companies/profile
```
Retrieves company profile with settings and usage statistics.

#### Update Company Profile
```
PUT /api/companies/profile
```
Updates company profile information.

### Landing Page Management

#### Get Landing Page
```
GET /api/companies/landing-page
```
Retrieves the company's customizable landing page data.

#### Update Landing Page
```
PUT /api/companies/landing-page
```
Updates the company's landing page content and styling.

**Request Body:**
```json
{
  "title": "Welcome to Ahmed Construction",
  "subtitle": "Professional construction services in Kabul",
  "heroImage": "https://example.com/hero.jpg",
  "aboutTitle": "About Ahmed Construction",
  "aboutContent": "We provide professional construction services...",
  "services": [
    {
      "title": "Machine Rental",
      "description": "Professional construction equipment rental",
      "icon": "engineering"
    }
  ],
  "testimonials": [
    {
      "name": "John Doe",
      "role": "Project Manager",
      "content": "Excellent service and quality work",
      "rating": 5
    }
  ],
  "contactEmail": "info@ahmedconstruction.com",
  "contactPhone": "+93 123 456 789",
  "contactAddress": "Kabul, Afghanistan",
  "socialLinks": {
    "facebook": "https://facebook.com/ahmedconstruction",
    "twitter": "https://twitter.com/ahmedconstruction"
  },
  "customCSS": ".hero-section { background: linear-gradient(45deg, #1976d2, #42a5f5); }",
  "isPublished": true
}
```

### Subscription Management

#### Get Subscription Plans
```
GET /api/companies/subscription-plans
```
Retrieves available subscription plans.

#### Get Current Subscription
```
GET /api/companies/subscription
```
Retrieves current company subscription details.

## Frontend Components

### SaaS Landing Page (`SaasLanding.tsx`)

The main platform landing page featuring:
- Hero section with call-to-action
- Feature showcase
- Pricing plans
- Customer testimonials
- Company registration form

### Company Selection (`CompanySelect.tsx`)

Allows users to:
- Browse available companies
- Search for specific companies
- Login to existing companies
- Register new companies

### Company Landing Page (`CompanyLanding.tsx`)

Fully customizable landing page with:
- Dynamic hero section
- About section
- Services showcase
- Testimonials
- Contact information
- Social media links
- Custom CSS/JS support

## Multi-Tenant Middleware

### Tenant Identification
```typescript
export const identifyCompany = async (req: TenantRequest, res: Response, next: NextFunction) => {
  const host = req.get('host') || '';
  const subdomain = host.split('.')[0];
  
  const company = await prisma.company.findFirst({
    where: {
      OR: [
        { domain: host },
        { subdomain: subdomain }
      ],
      isActive: true
    }
  });

  req.company = company;
  req.companyId = company.id;
  next();
};
```

### Company Access Control
```typescript
export const ensureCompanyAccess = async (req: TenantRequest, res: Response, next: NextFunction) => {
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
};
```

## Subscription Plans

### Available Plans

1. **FREE Plan**
   - 5 Users
   - 10 Machines
   - 5 Drivers
   - 10 Contracts
   - Basic Support
   - 30-day Trial

2. **BASIC Plan** ($99/month)
   - 10 Users
   - 25 Machines
   - 10 Drivers
   - 25 Contracts
   - Email Support
   - Custom Landing Page

3. **PROFESSIONAL Plan** ($299/month)
   - 25 Users
   - 50 Machines
   - 25 Drivers
   - 50 Contracts
   - Priority Support
   - Advanced Analytics
   - Custom Domain

4. **ENTERPRISE Plan** ($599/month)
   - 100 Users
   - 200 Machines
   - 100 Drivers
   - 200 Contracts
   - 24/7 Support
   - Dedicated Server
   - Custom Integration

## URL Structure

### Main Platform
- `https://construction.com/` - SaaS landing page
- `https://construction.com/company-select` - Company selection

### Company Subdomains
- `https://ahmed-construction.construction.com/` - Company landing page
- `https://ahmed-construction.construction.com/login` - Company login
- `https://ahmed-construction.construction.com/dashboard` - Company dashboard

### Custom Domains
- `https://ahmedconstruction.com/` - Custom domain (optional)

## Security Features

1. **Data Isolation**: Each company's data is completely isolated
2. **Role-based Access**: Users can only access their company's data
3. **JWT Authentication**: Secure token-based authentication
4. **Rate Limiting**: API rate limiting to prevent abuse
5. **Input Validation**: Comprehensive input validation and sanitization

## Deployment Considerations

### Database Setup
1. Run Prisma migrations: `npx prisma migrate dev`
2. Seed subscription plans: `npx ts-node prisma/seed-subscription-plans.ts`
3. Configure database connections for each company

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/construction_saas
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
NODE_ENV=production
```

### DNS Configuration
Configure wildcard DNS for subdomains:
```
*.construction.com -> Your server IP
```

### Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name *.construction.com construction.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Usage Examples

### Registering a New Company
1. Visit the main SaaS landing page
2. Click "Start Free Trial"
3. Fill in company information
4. Create admin account
5. Choose subscription plan
6. Company is created with subdomain

### Customizing Landing Page
1. Login to company dashboard
2. Navigate to Landing Page settings
3. Customize content, images, and styling
4. Add custom CSS/JS if needed
5. Publish the landing page

### Managing Users
1. Company admin can invite users
2. Users are automatically associated with the company
3. Role-based permissions apply
4. Users can only access company data

## Future Enhancements

1. **White-label Options**: Complete branding customization
2. **API Access**: RESTful API for integrations
3. **Mobile App**: Native mobile applications
4. **Advanced Analytics**: Business intelligence dashboards
5. **Payment Integration**: Stripe/PayPal integration
6. **Multi-language Support**: Internationalization
7. **Advanced Reporting**: Custom report builder
8. **Workflow Automation**: Business process automation

## Support and Maintenance

### Monitoring
- Application performance monitoring
- Database performance tracking
- Error logging and alerting
- Usage analytics

### Backup Strategy
- Automated database backups
- File storage backups
- Disaster recovery procedures

### Updates
- Regular security updates
- Feature releases
- Database migrations
- API versioning

This multi-tenant SaaS platform provides a comprehensive solution for construction companies to manage their operations with complete data isolation, customizable branding, and scalable subscription plans.