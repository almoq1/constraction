#!/bin/bash

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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        return 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        return 1
    fi

    print_success "Docker and Docker Compose are installed"
    return 0
}

# Deploy using Docker
deploy_docker() {
    print_status "Deploying with Docker Compose..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose down

    # Build and start containers
    print_status "Building and starting containers..."
    docker-compose up --build -d

    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30

    # Check if services are running
    print_status "Checking service status..."
    docker-compose ps

    print_success "Docker deployment completed!"
    print_status "Application is available at:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:5000"
    echo "   - Health check: http://localhost:5000/health"
}

# Deploy manually (without Docker)
deploy_manual() {
    print_status "Deploying manually..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v18 or higher."
        exit 1
    fi

    # Check if PostgreSQL is installed
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed. Please install PostgreSQL v13 or higher."
        exit 1
    fi

    # Install dependencies
    print_status "Installing server dependencies..."
    cd server
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install server dependencies"
        exit 1
    fi

    print_status "Installing client dependencies..."
    cd ../client
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install client dependencies"
        exit 1
    fi

    cd ..

    # Setup database
    print_status "Setting up database..."
    cd server
    npx prisma generate
    npx prisma db push
    npm run seed
    cd ..

    print_success "Manual deployment completed!"
    print_status "To start the application:"
    echo "   - Start server: cd server && npm run dev"
    echo "   - Start client: cd client && npm start"
}

# Production deployment
deploy_production() {
    print_status "Deploying to production..."
    
    # Check environment variables
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL environment variable is required for production deployment"
        exit 1
    fi

    if [ -z "$JWT_SECRET" ]; then
        print_error "JWT_SECRET environment variable is required for production deployment"
        exit 1
    fi

    # Build client for production
    print_status "Building client for production..."
    cd client
    npm run build
    if [ $? -ne 0 ]; then
        print_error "Failed to build client"
        exit 1
    fi
    cd ..

    # Build server for production
    print_status "Building server for production..."
    cd server
    npm run build
    if [ $? -ne 0 ]; then
        print_error "Failed to build server"
        exit 1
    fi
    cd ..

    print_success "Production build completed!"
    print_status "To start production server:"
    echo "   - cd server && npm start"
}

# Stop deployment
stop_deployment() {
    print_status "Stopping deployment..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose down
        print_success "Docker containers stopped"
    else
        print_warning "Docker Compose not found, cannot stop containers"
    fi
}

# Show logs
show_logs() {
    print_status "Showing logs..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose logs -f
    else
        print_warning "Docker Compose not found, cannot show logs"
    fi
}

# Backup database
backup_database() {
    print_status "Creating database backup..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose exec postgres pg_dump -U construction_user construction_db > backup_$(date +%Y%m%d_%H%M%S).sql
        print_success "Database backup created"
    else
        print_warning "Docker Compose not found, cannot create backup"
    fi
}

# Restore database
restore_database() {
    if [ -z "$1" ]; then
        print_error "Please provide backup file path"
        echo "Usage: $0 restore <backup_file.sql>"
        exit 1
    fi

    print_status "Restoring database from $1..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose exec -T postgres psql -U construction_user construction_db < "$1"
        print_success "Database restored"
    else
        print_warning "Docker Compose not found, cannot restore database"
    fi
}

# Show help
show_help() {
    echo "Construction SaaS Platform Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  docker      Deploy using Docker Compose"
    echo "  manual      Deploy manually (without Docker)"
    echo "  production  Build for production"
    echo "  stop        Stop Docker containers"
    echo "  logs        Show Docker logs"
    echo "  backup      Create database backup"
    echo "  restore     Restore database from backup"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 docker"
    echo "  $0 manual"
    echo "  $0 backup"
    echo "  $0 restore backup_20240225_143022.sql"
}

# Main script logic
case "${1:-help}" in
    docker)
        if check_docker; then
            deploy_docker
        else
            exit 1
        fi
        ;;
    manual)
        deploy_manual
        ;;
    production)
        deploy_production
        ;;
    stop)
        stop_deployment
        ;;
    logs)
        show_logs
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database "$2"
        ;;
    help|*)
        show_help
        ;;
esac