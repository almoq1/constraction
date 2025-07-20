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
    print_error "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Install root dependencies
print_status "Installing root dependencies..."
npm install

# Install server dependencies
print_status "Installing server dependencies..."
cd server
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating server .env file..."
    cp .env.example .env
    print_warning "Please update the server .env file with your database credentials and JWT secret."
fi

cd ..

# Install client dependencies
print_status "Installing client dependencies..."
cd client
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating client .env file..."
    echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
    echo "REACT_APP_SOCKET_URL=http://localhost:5000" >> .env
fi

cd ..

print_success "Dependencies installed successfully!"

# Database setup instructions
echo ""
print_status "Database Setup Instructions:"
echo "1. Install PostgreSQL if not already installed"
echo "2. Create a database named 'construction_saas'"
echo "3. Update the DATABASE_URL in server/.env"
echo "4. Run the following commands:"
echo "   cd server"
echo "   npm run setup-db"
echo ""

# Development instructions
print_status "Development Instructions:"
echo "To start development:"
echo "1. Start the server: npm run server"
echo "2. Start the client: npm run client"
echo "3. Or start both: npm run dev"
echo ""

print_status "Access URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:5000"
echo "- API Health Check: http://localhost:5000/health"
echo ""

print_success "Setup completed! 🎉"
print_warning "Don't forget to:"
echo "1. Configure your database connection"
echo "2. Set up your JWT secret"
echo "3. Configure email settings (optional)"
echo "4. Set up file upload directory (optional)"