#!/bin/bash

echo "🚀 Setting up Complete Construction SaaS Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting SaaS Platform Setup..."

# 1. Install dependencies
print_status "Installing dependencies..."
npm install

# 2. Setup server
print_status "Setting up server..."
cd server

# Install server dependencies
npm install

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Run database migrations
print_status "Running database migrations..."
npx prisma migrate dev --name init-saas-system

# Seed the database
print_status "Seeding database..."
npx ts-node prisma/seed.ts

# Create super admin user
print_status "Creating super admin user..."
npx ts-node prisma/seed-super-admin.ts

# Seed subscription plans
print_status "Creating subscription plans..."
npx ts-node prisma/seed-subscription-plans.ts

cd ..

# 3. Setup client
print_status "Setting up client..."
cd client

# Install client dependencies
npm install

cd ..

# 4. Create environment files
print_status "Creating environment files..."

# Server .env
cat > server/.env << EOF
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/construction_saas"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=5000
NODE_ENV=development

# Super Admin
SUPER_ADMIN_EMAIL="admin@construction.com"
SUPER_ADMIN_PASSWORD="admin123456"
SUPER_ADMIN_NAME="Super Admin"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# Client .env
cat > client/.env << EOF
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
EOF

print_success "Environment files created"

# 5. Create startup scripts
print_status "Creating startup scripts..."

# Start server script
cat > start-server.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Construction SaaS Server..."
cd server
npm run dev
EOF

# Start client script
cat > start-client.sh << 'EOF'
#!/bin/bash
echo "🌐 Starting Construction SaaS Client..."
cd client
npm start
EOF

# Start both script
cat > start-saas.sh << 'EOF'
#!/bin/bash
echo "🏗️ Starting Complete Construction SaaS Platform..."

# Start server in background
echo "Starting server..."
cd server
npm run dev &
SERVER_PID=$!

# Wait a moment for server to start
sleep 5

# Start client
echo "Starting client..."
cd ../client
npm start &
CLIENT_PID=$!

echo "✅ SaaS Platform is starting..."
echo "Server PID: $SERVER_PID"
echo "Client PID: $CLIENT_PID"
echo ""
echo "🌐 Client: http://localhost:3000"
echo "🔧 Server: http://localhost:5000"
echo "👑 Super Admin: http://localhost:3000/super-admin/login"
echo ""
echo "Super Admin Credentials:"
echo "Email: admin@construction.com"
echo "Password: admin123456"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for both processes
wait $SERVER_PID $CLIENT_PID
EOF

# Make scripts executable
chmod +x start-server.sh start-client.sh start-saas.sh

print_success "Startup scripts created"

# 6. Create system verification script
cat > verify-system.sh << 'EOF'
#!/bin/bash

echo "🔍 Verifying SaaS System..."

# Check if server is running
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running"
fi

# Check if client is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Client is running"
else
    echo "❌ Client is not running"
fi

# Check database connection
cd server
if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
    echo "✅ Database connection is working"
else
    echo "❌ Database connection failed"
fi

echo "🔍 System verification complete"
EOF

chmod +x verify-system.sh

# 7. Create production deployment script
cat > deploy-production.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying to Production..."

# Build client
echo "Building client..."
cd client
npm run build
cd ..

# Build server
echo "Building server..."
cd server
npm run build
cd ..

echo "✅ Production build complete"
echo "📁 Client build: client/build"
echo "📁 Server build: server/dist"
EOF

chmod +x deploy-production.sh

# 8. Create README with instructions
cat > SAAS_SETUP_README.md << 'EOF'
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
./verify-system.sh
```

## 🌐 Access URLs

- **Main Platform**: http://localhost:3000
- **Super Admin**: http://localhost:3000/super-admin/login
- **API Server**: http://localhost:5000
- **Company Selection**: http://localhost:3000/company-select

## 👑 Super Admin Access

- **Email**: admin@construction.com
- **Password**: admin123456

## 🏢 SaaS Features

### Super Admin Capabilities
1. **Platform Management**: Complete control over the SaaS platform
2. **Company Management**: Create, manage, and monitor construction companies
3. **User Management**: Manage users across all companies
4. **Payment Management**: Handle subscription payments (Cash, Bank Transfer, HesabPay)
5. **System Settings**: Configure platform-wide settings

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

## 🔧 API Endpoints

### Super Admin APIs
- `/api/super-admin/*` - Platform management
- `/api/super-admin/payments/*` - Payment management

### Company APIs
- `/api/companies/*` - Company management
- `/api/companies/:id/landing-page` - Landing page customization

### Construction APIs
- `/api/machines/*` - Machine management
- `/api/drivers/*` - Driver management
- `/api/contracts/*` - Contract management

## 🛠️ Development

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

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

# Reset database
npx prisma migrate reset
```

## 🔒 Security Features

1. **Multi-tenant Isolation**: Complete data separation between companies
2. **Role-based Access**: SUPER_ADMIN, ADMIN, MANAGER, USER roles
3. **JWT Authentication**: Secure token-based authentication
4. **Input Validation**: Comprehensive validation and sanitization
5. **Rate Limiting**: API rate limiting for security

## 📊 Monitoring & Analytics

1. **Platform Overview**: Total companies, users, machines, contracts
2. **Payment Analytics**: Revenue tracking and payment method analysis
3. **Subscription Statistics**: Plan distribution and usage
4. **System Health**: Platform status and performance monitoring

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
2. Verify system with `./verify-system.sh`
3. Check logs for error messages
4. Ensure all dependencies are installed

---

**Construction SaaS Platform** - Complete Multi-tenant SaaS Solution
EOF

print_success "Complete SaaS Platform Setup Complete!"

echo ""
echo "🎉 Construction SaaS Platform is ready!"
echo ""
echo "📋 Next Steps:"
echo "1. Start the system: ./start-saas.sh"
echo "2. Access Super Admin: http://localhost:3000/super-admin/login"
echo "3. Create companies and manage the platform"
echo ""
echo "🔑 Super Admin Credentials:"
echo "Email: admin@construction.com"
echo "Password: admin123456"
echo ""
echo "📚 Read the setup guide: SAAS_SETUP_README.md"
echo ""
print_success "Setup complete! The SaaS platform is ready to use."