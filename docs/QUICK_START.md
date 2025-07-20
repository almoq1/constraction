# Quick Start Guide - Construction SaaS Platform

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **PostgreSQL** (version 12 or higher)
- **Git** (for version control)

## 📦 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd construction-saas-platform
```

### 2. Run the Setup Script
```bash
chmod +x setup.sh
./setup.sh
```

This script will:
- Install all dependencies (root, server, and client)
- Create environment files
- Set up the project structure

### 3. Database Setup

#### Install PostgreSQL
- **Ubuntu/Debian**: `sudo apt-get install postgresql postgresql-contrib`
- **macOS**: `brew install postgresql`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Create Database
```sql
CREATE DATABASE construction_saas;
CREATE USER construction_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE construction_saas TO construction_user;
```

#### Update Environment Variables
Edit `server/.env`:
```env
DATABASE_URL="postgresql://construction_user:your_password@localhost:5432/construction_saas"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:3000"
```

### 4. Initialize Database
```bash
cd server
npm run setup-db
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
# Start both server and client
npm run dev

# Or start them separately
npm run server  # Backend on port 5000
npm run client  # Frontend on port 3000
```

### Production Mode
```bash
# Build the client
cd client
npm run build

# Start the server
cd ../server
npm run build
npm start
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 👤 First Login

1. Navigate to http://localhost:3000
2. Click "Register" to create your first account
3. Use role "ADMIN" for full access
4. Login with your credentials

## 📋 Initial Setup

### 1. Add Your First Machine
1. Go to Machines → Add Machine
2. Fill in machine details (name, type, model, rates)
3. Save the machine

### 2. Add Drivers and Assistants
1. Go to Drivers → Add Driver
2. Fill in driver details (name, phone, license, salary)
3. Repeat for assistants

### 3. Create Your First Contract
1. Go to Contracts → New Contract
2. Fill in contract details
3. Assign machines to the contract
4. Set required hours per day

### 4. Add Land/Room Rentals
1. Go to Rentals → Add Land or Add Room
2. Fill in property details
3. Create rental agreements

## 🔧 Configuration

### Environment Variables

#### Server (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/construction_saas"

# Security
JWT_SECRET="your-jwt-secret-key"

# Server
PORT=5000
NODE_ENV=development

# Client URL for CORS
CLIENT_URL="http://localhost:3000"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

#### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Language Configuration
The platform supports three languages:
- **English** (default)
- **Dari** (Persian/Farsi)
- **Pashto**

Users can change their language preference in their profile settings.

## 📊 Key Features to Explore

### 1. Dashboard
- Overview of all key metrics
- Recent activities
- Financial summary
- Upcoming due dates

### 2. Machine Management
- Add/Edit machines
- Track availability
- Record daily hours
- View utilization reports

### 3. Personnel Management
- Driver and assistant profiles
- Salary calculations
- Vacation tracking
- Assignment history

### 4. Contract Management
- Create contracts
- Assign machines
- Track payments
- Monitor performance

### 5. Rental Management
- Land and room inventory
- Tenant management
- Payment tracking
- Due date alerts

### 6. Financial Management
- Payment recording
- Financial reports
- Salary management
- Expense tracking

## 🔔 Alert System

The platform includes automated alerts for:
- **Rent Due**: Notifications for upcoming rent payments
- **Salary Due**: Reminders for pending salary payments
- **Contract Expiry**: Warnings for expiring contracts
- **System Alerts**: General system notifications

## 📱 Mobile Access

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permissions for different user roles
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API rate limiting for security

## 🛠️ Development

### Project Structure
```
construction-saas-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static files
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── services/      # Business logic
│   │   └── lib/           # Database and utilities
│   └── prisma/            # Database schema
├── docs/                  # Documentation
└── README.md
```

### Available Scripts

#### Root Level
```bash
npm run dev          # Start both server and client
npm run server       # Start server only
npm run client       # Start client only
npm run build        # Build client for production
npm run install-all  # Install all dependencies
```

#### Server Level
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run setup-db     # Initialize database
npm run studio       # Open Prisma Studio
```

#### Client Level
```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql
```

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :5000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### Permission Denied
```bash
# Make setup script executable
chmod +x setup.sh
```

#### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For issues and questions:
1. Check the documentation in the `docs/` folder
2. Review the troubleshooting section above
3. Check the console logs for error messages
4. Ensure all prerequisites are properly installed

## 🚀 Next Steps

After successful setup:
1. Explore all features in the dashboard
2. Add your first machines, drivers, and contracts
3. Configure alerts and notifications
4. Set up automated backups
5. Customize the system for your specific needs

Welcome to your Construction SaaS Platform! 🎉