# Construction SaaS Platform - Complete Setup Guide

## 🚀 Quick Start

### 1. Start the Complete System
```bash
./start-saas.sh
```

### 2. Start Individual Services
```bash
# Start server only
./start-server.sh

# Start client only
./start-client.sh
```

### 3. Verify System
```bash
./verify-saas-system.sh
```

## 🌐 Access URLs

- **Main Platform**: http://localhost:3000
- **Super Admin**: http://localhost:3000/super-admin/login
- **API Server**: http://localhost:5000
- **Company Selection**: http://localhost:3000/company-select
- **System Health Check**: http://localhost:5000/api/health

## 👑 Super Admin Access

- **Email**: admin@construction.com
- **Password**: admin123456

## 🏢 SaaS Features

### Super Admin Capabilities
1. **Platform Management**: Complete control over the SaaS platform
2. **Company Management**: Create, manage, and monitor construction companies
3. **User Management**: Manage users across all companies
4. **Payment Management**: Handle subscription payments (Cash, Bank Transfer, HesabPay, Credit/Debit Card)
5. **System Settings**: Configure platform-wide settings
6. **System Status**: Real-time health and feature monitoring

### Company Features
1. **Custom Landing Pages**: Each company gets a customizable landing page
2. **Subdomain Access**: Companies access via subdomain (company.construction.com)
3. **Isolated Data**: Database-per-tenant architecture
4. **Subscription Plans**: Multiple plan tiers (FREE, BASIC, PROFESSIONAL, ENTERPRISE)
5. **Construction Management**: Full construction management system

### Payment Methods
1. **Cash**: Physical cash payments with receipt tracking
2. **Bank Transfer**: Electronic bank transfers with transaction IDs
3. **HesabPay**: Digital payment platform integration
4. **Credit/Debit Cards**: Card payment processing

## 🗄️ Database Schema

### Core Models
- **Company**: Multi-tenant company management
- **User**: User management with role-based access
- **CompanySubscriptionPayment**: Payment tracking and billing
- **SubscriptionPlan**: Plan management and pricing
- **LandingPage**: Customizable company landing pages

### Construction Models
- **Machine**: Equipment management
- **Driver**: Driver management
- **Contract**: Project and contract management
- **Payment**: Construction payment tracking

### Payment Management Models
- **CompanySubscriptionPayment**: Tracks all company subscription payments, payment method, status, billing period, etc.
- **Enums**: `PaymentMethod` (CASH, BANK_TRANSFER, HESABPAY, CREDIT_CARD, DEBIT_CARD), `PaymentStatus` (PENDING, PAID, OVERDUE, CANCELLED, FAILED)

## 🔧 API Endpoints

### Super Admin APIs
- `/api/super-admin/*` - Platform management
- `/api/super-admin/payments/*` - Payment management
- `/api/health` - System health check

#### Payment Management Endpoints
- `GET /api/super-admin/payments/overview` - Payment statistics and analytics
- `GET /api/super-admin/payments/payments` - List all payments
- `POST /api/super-admin/payments/payments` - Create payment record
- `PUT /api/super-admin/payments/payments/:id/status` - Update payment status
- `POST /api/super-admin/payments/generate-bills` - Generate monthly bills
- `GET /api/super-admin/payments/overdue` - List overdue payments
- `GET /api/super-admin/payments/reports` - Payment analytics and reports

#### Health Check Endpoints
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system check

## 🖥️ Frontend Features

### Super Admin Dashboard
- **Overview Tab**: Platform statistics, recent companies, system status
- **Companies Tab**: Company management with CRUD operations
- **Users Tab**: User management across all companies
- **Payments Tab**: Full payment management dashboard (overview, all payments, overdue, reports)
- **Settings Tab**: System configuration and settings
- **System Status**: Real-time health and feature monitoring

### Payment Management Dashboard
- **Overview**: Payment statistics, recent payments, payment methods breakdown, upcoming payments
- **All Payments**: Full payment records, create/update/delete, generate bills
- **Overdue**: Overdue payment tracking and quick status update
- **Reports**: Payment analytics and reporting

### System Status Component
- Real-time health check and feature status
- Database, API, and feature availability
- Uptime and version info

## 🛠️ Development

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn
- **For Windows:** Use [WSL (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/install) or Git Bash to run setup scripts.

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/construction_saas"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Super Admin
SUPER_ADMIN_EMAIL="admin@construction.com"
SUPER_ADMIN_PASSWORD="admin123456"
```

### Database Commands
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx ts-node prisma/seed.ts
npx ts-node prisma/seed-super-admin.ts
npx ts-node prisma/seed-subscription-plans.ts
```

## 🟢 Windows Setup Notes
- **Do NOT use Command Prompt or PowerShell for Bash scripts.**
- Use **WSL** (recommended) or **Git Bash** for running `setup-saas-system.sh`, `start-saas.sh`, etc.
- If you want to run manually, run each command in the script step by step in PowerShell or WSL.

## 🔒 Security Features

1. **Multi-tenant Isolation**: Complete data separation between companies
2. **Role-based Access**: SUPER_ADMIN, ADMIN, MANAGER, USER roles
3. **JWT Authentication**: Secure token-based authentication
4. **Input Validation**: Comprehensive validation and sanitization
5. **Rate Limiting**: API rate limiting for security
6. **Audit Logging**: All payment and admin actions are logged

## 📊 Monitoring & Analytics

1. **Platform Overview**: Total companies, users, machines, contracts
2. **Payment Analytics**: Revenue tracking and payment method analysis
3. **Subscription Statistics**: Plan distribution and usage
4. **System Health**: Platform status and performance monitoring
5. **SystemStatus Component**: Real-time dashboard for system health

## 🚀 Production Deployment

1. **Build for Production**:
   ```bash
   ./deploy-production.sh
   ```

2. **Environment Setup**:
   - Set production environment variables
   - Configure production database
   - Set up SSL certificates
   - Configure reverse proxy

3. **Database Setup**:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

## 🆘 Troubleshooting

### Common Issues
1. **Database Connection**: Check DATABASE_URL in .env
2. **Port Conflicts**: Ensure ports 3000 and 5000 are available
3. **Dependencies**: Run `npm install` in both client and server directories
4. **Prisma Issues**: Run `npx prisma generate` and `npx prisma migrate dev`

### Logs
- Server logs: Check server console output
- Client logs: Check browser developer tools
- Database logs: Check PostgreSQL logs

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify system with `./verify-saas-system.sh`
3. Check logs for error messages
4. Ensure all dependencies are installed

---

**Construction SaaS Platform** - Complete Multi-tenant SaaS Solution

---

**New Features (2024):**
- ✅ **Super Admin Payment Management Dashboard** (overview, all payments, overdue, reports)
- ✅ **Company Subscription Payments** (cash, bank transfer, HesabPay, credit/debit card)
- ✅ **Automated Monthly Billing**
- ✅ **Overdue Payment Tracking**
- ✅ **Payment Analytics & Reporting**
- ✅ **System Health Check API & Dashboard**
- ✅ **SystemStatus Component** (real-time system health)
- ✅ **Full SaaS Compatibility** (multi-tenant, scalable, secure)