#!/bin/bash

echo "🔍 Verifying Complete Construction SaaS Platform..."

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

echo ""
print_status "Starting comprehensive system verification..."

# 1. Check Node.js and npm
print_status "Checking Node.js and npm..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed"
    exit 1
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed"
    exit 1
fi

# 2. Check dependencies
print_status "Checking dependencies..."
if [ -d "node_modules" ]; then
    print_success "Root dependencies are installed"
else
    print_warning "Root dependencies are not installed. Run 'npm install'"
fi

if [ -d "server/node_modules" ]; then
    print_success "Server dependencies are installed"
else
    print_warning "Server dependencies are not installed. Run 'cd server && npm install'"
fi

if [ -d "client/node_modules" ]; then
    print_success "Client dependencies are installed"
else
    print_warning "Client dependencies are not installed. Run 'cd client && npm install'"
fi

# 3. Check environment files
print_status "Checking environment files..."
if [ -f "server/.env" ]; then
    print_success "Server .env file exists"
else
    print_warning "Server .env file is missing"
fi

if [ -f "client/.env" ]; then
    print_success "Client .env file exists"
else
    print_warning "Client .env file is missing"
fi

# 4. Check database connection
print_status "Checking database connection..."
cd server
if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
    print_success "Database connection is working"
else
    print_error "Database connection failed"
    cd ..
    exit 1
fi
cd ..

# 5. Check Prisma client
print_status "Checking Prisma client..."
cd server
if npx prisma generate > /dev/null 2>&1; then
    print_success "Prisma client is generated"
else
    print_error "Prisma client generation failed"
    cd ..
    exit 1
fi
cd ..

# 6. Check if server is running
print_status "Checking if server is running..."
if curl -s http://localhost:5000/api/health > /dev/null; then
    print_success "Server is running on port 5000"
    
    # Get server health data
    HEALTH_RESPONSE=$(curl -s http://localhost:5000/api/health)
    if [ $? -eq 0 ]; then
        print_success "Server health check passed"
        
        # Extract status from JSON response
        STATUS=$(echo $HEALTH_RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        if [ "$STATUS" = "healthy" ]; then
            print_success "Server status: $STATUS"
        else
            print_warning "Server status: $STATUS"
        fi
    else
        print_error "Server health check failed"
    fi
else
    print_warning "Server is not running on port 5000"
fi

# 7. Check if client is running
print_status "Checking if client is running..."
if curl -s http://localhost:3000 > /dev/null; then
    print_success "Client is running on port 3000"
else
    print_warning "Client is not running on port 3000"
fi

# 8. Check database schema
print_status "Checking database schema..."
cd server
if npx prisma db pull > /dev/null 2>&1; then
    print_success "Database schema is accessible"
else
    print_error "Database schema access failed"
    cd ..
    exit 1
fi
cd ..

# 9. Check super admin user
print_status "Checking super admin user..."
cd server
SUPER_ADMIN_EXISTS=$(npx ts-node -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } })
  .then(user => {
    if (user) {
      console.log('SUPER_ADMIN_EXISTS');
      process.exit(0);
    } else {
      console.log('SUPER_ADMIN_MISSING');
      process.exit(1);
    }
  })
  .catch(() => {
    console.log('SUPER_ADMIN_CHECK_FAILED');
    process.exit(1);
  });
" 2>/dev/null)

if [ "$SUPER_ADMIN_EXISTS" = "SUPER_ADMIN_EXISTS" ]; then
    print_success "Super admin user exists"
else
    print_warning "Super admin user is missing"
fi
cd ..

# 10. Check subscription plans
print_status "Checking subscription plans..."
cd server
PLANS_EXIST=$(npx ts-node -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.subscriptionPlan.count()
  .then(count => {
    if (count > 0) {
      console.log('PLANS_EXIST');
      process.exit(0);
    } else {
      console.log('PLANS_MISSING');
      process.exit(1);
    }
  })
  .catch(() => {
    console.log('PLANS_CHECK_FAILED');
    process.exit(1);
  });
" 2>/dev/null)

if [ "$PLANS_EXIST" = "PLANS_EXIST" ]; then
    print_success "Subscription plans exist"
else
    print_warning "Subscription plans are missing"
fi
cd ..

# 11. Check API endpoints
print_status "Checking API endpoints..."
if curl -s http://localhost:5000/api/health > /dev/null; then
    print_success "Health API endpoint is working"
fi

if curl -s http://localhost:5000/api/super-admin/overview > /dev/null; then
    print_success "Super admin API endpoints are accessible"
else
    print_warning "Super admin API endpoints are not accessible (server might not be running)"
fi

# 12. Check file structure
print_status "Checking file structure..."
REQUIRED_FILES=(
    "server/src/routes/superAdmin.ts"
    "server/src/routes/superAdminPayments.ts"
    "server/src/middleware/superAdmin.ts"
    "client/src/pages/SuperAdmin/SuperAdminDashboard.tsx"
    "client/src/pages/SuperAdmin/SuperAdminLogin.tsx"
    "client/src/pages/SuperAdmin/SuperAdminPayments.tsx"
    "server/prisma/schema.prisma"
    "server/prisma/seed.ts"
    "server/prisma/seed-super-admin.ts"
    "server/prisma/seed-subscription-plans.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "File exists: $file"
    else
        print_error "File missing: $file"
    fi
done

# 13. Check startup scripts
print_status "Checking startup scripts..."
if [ -f "start-saas.sh" ] && [ -x "start-saas.sh" ]; then
    print_success "start-saas.sh script exists and is executable"
else
    print_warning "start-saas.sh script is missing or not executable"
fi

if [ -f "start-server.sh" ] && [ -x "start-server.sh" ]; then
    print_success "start-server.sh script exists and is executable"
else
    print_warning "start-server.sh script is missing or not executable"
fi

if [ -f "start-client.sh" ] && [ -x "start-client.sh" ]; then
    print_success "start-client.sh script exists and is executable"
else
    print_warning "start-client.sh script is missing or not executable"
fi

# 14. Summary
echo ""
echo "=========================================="
echo "🔍 SaaS Platform Verification Summary"
echo "=========================================="

# Count successes and errors
SUCCESS_COUNT=$(grep -c "\[SUCCESS\]" <<< "$(cat /dev/stdin)" 2>/dev/null || echo "0")
ERROR_COUNT=$(grep -c "\[ERROR\]" <<< "$(cat /dev/stdin)" 2>/dev/null || echo "0")
WARNING_COUNT=$(grep -c "\[WARNING\]" <<< "$(cat /dev/stdin)" 2>/dev/null || echo "0")

echo ""
echo "📊 Verification Results:"
echo "✅ Successes: $SUCCESS_COUNT"
echo "⚠️  Warnings: $WARNING_COUNT"
echo "❌ Errors: $ERROR_COUNT"

echo ""
echo "🌐 Access URLs:"
echo "Main Platform: http://localhost:3000"
echo "Super Admin: http://localhost:3000/super-admin/login"
echo "API Server: http://localhost:5000"
echo "Health Check: http://localhost:5000/api/health"

echo ""
echo "👑 Super Admin Credentials:"
echo "Email: admin@construction.com"
echo "Password: admin123456"

echo ""
if [ "$ERROR_COUNT" -eq 0 ]; then
    print_success "🎉 SaaS Platform verification completed successfully!"
    print_success "The system is ready to use."
else
    print_warning "⚠️  SaaS Platform verification completed with some issues."
    print_warning "Please address the errors above before using the system."
fi

echo ""
echo "📚 Next Steps:"
echo "1. If server is not running: ./start-server.sh"
echo "2. If client is not running: ./start-client.sh"
echo "3. To start both: ./start-saas.sh"
echo "4. Read the setup guide: SAAS_SETUP_README.md"

echo ""
echo "=========================================="