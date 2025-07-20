#!/bin/bash

echo "🚀 Setting up Construction SaaS Platform..."

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL is not installed. Please install PostgreSQL v13 or higher."
    print_warning "You can download it from: https://www.postgresql.org/download/"
    read -p "Do you want to continue without PostgreSQL? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "PostgreSQL is installed"
fi

# Create environment files if they don't exist
print_status "Setting up environment files..."

if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    print_success "Created server/.env from example"
else
    print_warning "server/.env already exists"
fi

if [ ! -f "client/.env" ]; then
    cp client/.env.example client/.env
    print_success "Created client/.env from example"
else
    print_warning "client/.env already exists"
fi

# Install server dependencies
print_status "Installing server dependencies..."
cd server
npm install
if [ $? -eq 0 ]; then
    print_success "Server dependencies installed successfully"
else
    print_error "Failed to install server dependencies"
    exit 1
fi

# Install client dependencies
print_status "Installing client dependencies..."
cd ../client
npm install
if [ $? -eq 0 ]; then
    print_success "Client dependencies installed successfully"
else
    print_error "Failed to install client dependencies"
    exit 1
fi

# Setup database
print_status "Setting up database..."
cd ../server

# Check if DATABASE_URL is set
if grep -q "postgresql://username:password@localhost:5432/construction_db" .env; then
    print_warning "Please update the DATABASE_URL in server/.env with your PostgreSQL credentials"
    print_warning "Format: postgresql://username:password@localhost:5432/construction_db"
    read -p "Do you want to continue without setting up the database? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    if [ $? -eq 0 ]; then
        print_success "Prisma client generated successfully"
    else
        print_error "Failed to generate Prisma client"
        exit 1
    fi

    # Push database schema
    print_status "Pushing database schema..."
    npx prisma db push
    if [ $? -eq 0 ]; then
        print_success "Database schema pushed successfully"
    else
        print_error "Failed to push database schema"
        print_warning "Make sure PostgreSQL is running and DATABASE_URL is correct"
        exit 1
    fi

    # Seed database
    print_status "Seeding database..."
    npx prisma db seed
    if [ $? -eq 0 ]; then
        print_success "Database seeded successfully"
    else
        print_warning "Failed to seed database (this is optional)"
    fi
fi

cd ..

# Create uploads directory
print_status "Creating uploads directory..."
mkdir -p server/uploads
print_success "Uploads directory created"

# Build the application
print_status "Building the application..."
cd client
npm run build
if [ $? -eq 0 ]; then
    print_success "Application built successfully"
else
    print_warning "Failed to build application (this is optional for development)"
fi

cd ..

# Create start scripts
print_status "Creating start scripts..."

cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Construction SaaS Platform in development mode..."

# Start server in background
echo "Starting server..."
cd server
npm run dev &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Start client
echo "Starting client..."
cd ../client
npm start &
CLIENT_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Shutting down..."
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
EOF

chmod +x start-dev.sh

cat > start-prod.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Construction SaaS Platform in production mode..."

# Build client
echo "Building client..."
cd client
npm run build
if [ $? -ne 0 ]; then
    echo "Failed to build client"
    exit 1
fi

# Start server
echo "Starting server..."
cd ../server
npm start
EOF

chmod +x start-prod.sh

print_success "Start scripts created"

# Create database setup script
cat > setup-db.sh << 'EOF'
#!/bin/bash
echo "🗄️ Setting up database..."

cd server

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push database schema
echo "Pushing database schema..."
npx prisma db push

# Seed database
echo "Seeding database..."
npx prisma db seed

echo "✅ Database setup complete!"
EOF

chmod +x setup-db.sh

print_success "Database setup script created"

# Final instructions
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update server/.env with your PostgreSQL credentials"
echo "2. Update client/.env if needed"
echo "3. Run database setup: ./setup-db.sh"
echo "4. Start development server: ./start-dev.sh"
echo "5. Start production server: ./start-prod.sh"
echo ""
echo "🌐 Application will be available at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo "   - Health check: http://localhost:5000/health"
echo ""
echo "📚 For more information, see README.md"
echo ""