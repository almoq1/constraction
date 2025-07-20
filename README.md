# 🏗️ Construction SaaS Platform

A comprehensive SaaS platform for construction companies to manage machines, drivers, contracts, rentals, payments, and alerts with real-time updates and multi-language support.

## ✨ Features

### 🚀 Core Management Modules
- **Machine Management** - Complete CRUD with status tracking and hour monitoring
- **Driver Management** - Personnel management with salary tracking and assistant assignments
- **Contract Management** - Project tracking with progress monitoring and machine assignments
- **Rental Management** - Land and room rentals with tenant management
- **Payment Management** - Comprehensive financial tracking and reporting
- **Alerts Management** - Automated notification system for various events
- **Profile Management** - User preferences and security settings

### 🎯 Business Logic Features
- **30-day Month Calculation** for consistent billing
- **Salary Management** with partial payments and deductions
- **Rent Payment Tracking** with advance payments and alerts
- **Machine Hour Tracking** with automated calculations
- **Financial Reporting** with comprehensive summaries
- **Automated Alerts** for rent due, maintenance, contracts
- **Working Hours vs Required Hours** tracking

### 🔧 Technical Features
- **Real-time Updates** with Socket.io
- **Multi-language Support** (English, Dari, Pashto)
- **Responsive Design** for all devices
- **Role-based Access Control** (Admin, Manager, Operator)
- **JWT Authentication** with secure token management
- **Form Validation** and comprehensive error handling
- **File Upload** capabilities for avatars and documents
- **Professional UI/UX** with Material-UI components

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **React Hook Form** for form management
- **Socket.io Client** for real-time updates
- **Axios** for API communication
- **i18next** for internationalization
- **Recharts** for data visualization

### Backend
- **Node.js** with TypeScript
- **Express.js** framework
- **Prisma ORM** with PostgreSQL
- **Socket.io** for real-time communication
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Multer** for file uploads
- **Node-cron** for scheduled tasks
- **Nodemailer** for email notifications

### Database
- **PostgreSQL** for primary data storage
- **Redis** for caching and sessions

### DevOps
- **Docker** and **Docker Compose** for containerization
- **Nginx** for reverse proxy and static file serving
- **Environment-based configuration**

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL 13 or higher
- Docker and Docker Compose (optional)

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd construction-saas-platform
   ```

2. **Deploy with Docker**
   ```bash
   ./deploy.sh docker
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health check: http://localhost:5000/health

### Option 2: Manual Setup

1. **Run the setup script**
   ```bash
   ./setup.sh
   ```

2. **Configure environment variables**
   ```bash
   # Update server/.env with your database credentials
   cp server/.env.example server/.env
   # Edit server/.env with your PostgreSQL connection details
   ```

3. **Setup database**
   ```bash
   ./setup-db.sh
   ```

4. **Start the application**
   ```bash
   # Development mode
   ./start-dev.sh
   
   # Or start manually:
   # Terminal 1: cd server && npm run dev
   # Terminal 2: cd client && npm start
   ```

## 📋 Default Login Credentials

After running the setup, you can log in with:

- **Admin User:**
  - Email: `admin@construction.com`
  - Password: `admin123`

- **Manager User:**
  - Email: `manager@construction.com`
  - Password: `admin123`

## 🗄️ Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users** - Authentication and user management
- **Machines** - Equipment tracking and management
- **Drivers** - Personnel management
- **Driver Assistants** - Support staff management
- **Contracts** - Project and client management
- **Land/Room Rentals** - Property rental management
- **Payments** - Financial transaction tracking
- **Alerts** - Notification system
- **Machine Hours** - Work hour tracking
- **Salary Payments** - Employee compensation

## 🔧 Configuration

### Environment Variables

#### Server (.env)
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/construction_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

#### Client (.env)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Application Configuration
REACT_APP_NAME="Construction SaaS Platform"
REACT_APP_VERSION="1.0.0"

# Feature Flags
REACT_APP_ENABLE_SOCKET=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_FILE_UPLOAD=true
```

## 🚀 Deployment

### Production Deployment

1. **Set environment variables**
   ```bash
   export DATABASE_URL="your-production-database-url"
   export JWT_SECRET="your-production-jwt-secret"
   ```

2. **Build for production**
   ```bash
   ./deploy.sh production
   ```

3. **Start production server**
   ```bash
   cd server && npm start
   ```

### Docker Production Deployment

1. **Update docker-compose.yml with production settings**
2. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Machine Management
- `GET /api/machines` - Get all machines
- `POST /api/machines` - Create new machine
- `PUT /api/machines/:id` - Update machine
- `DELETE /api/machines/:id` - Delete machine
- `POST /api/machines/:id/assign` - Assign machine to driver

### Driver Management
- `GET /api/drivers` - Get all drivers
- `POST /api/drivers` - Create new driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver
- `POST /api/drivers/:id/salary` - Process salary payment

### Contract Management
- `GET /api/contracts` - Get all contracts
- `POST /api/contracts` - Create new contract
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract
- `POST /api/contracts/:id/machines` - Assign machines to contract

### Rental Management
- `GET /api/rentals/land` - Get land rentals
- `GET /api/rentals/rooms` - Get room rentals
- `POST /api/rentals/land` - Create land rental
- `POST /api/rentals/rooms` - Create room rental

### Payment Management
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create new payment
- `GET /api/payments/summary` - Get payment summary
- `GET /api/payments/statistics` - Get payment statistics

### Alerts Management
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/statistics` - Get dashboard statistics
- `GET /api/dashboard/trends` - Get dashboard trends

## 🔄 Real-time Features

The application uses Socket.io for real-time updates:

- **Live Dashboard Updates** - Real-time KPI updates
- **Alert Notifications** - Instant alert delivery
- **Payment Updates** - Live payment status changes
- **Machine Status Changes** - Real-time equipment status
- **Contract Progress** - Live project progress updates

## 🌐 Multi-language Support

The application supports multiple languages:
- **English** (Default)
- **Dari** (دری)
- **Pashto** (پښتو)

Language can be changed from the user profile settings.

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcryptjs
- **Input Validation** with express-validator
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for secure cross-origin requests
- **Helmet.js** for security headers
- **SQL Injection Prevention** with Prisma ORM

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop** (1920px and above)
- **Laptop** (1366px - 1919px)
- **Tablet** (768px - 1365px)
- **Mobile** (320px - 767px)

## 🧪 Testing

### Run Tests
```bash
# Server tests
cd server && npm test

# Client tests
cd client && npm test
```

### API Testing
```bash
# Health check
curl http://localhost:5000/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@construction.com","password":"admin123"}'
```

## 📈 Monitoring and Logging

### Health Checks
- **API Health**: `GET /health`
- **Database Health**: Integrated in health check
- **Socket.io Health**: Connection status monitoring

### Logging
- **Server Logs**: Morgan HTTP logging
- **Error Logging**: Comprehensive error tracking
- **Database Logs**: Prisma query logging (development)

## 🔧 Maintenance

### Database Backup
```bash
# Create backup
./deploy.sh backup

# Restore backup
./deploy.sh restore backup_20240225_143022.sql
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
./deploy.sh docker
```

### View Logs
```bash
# Docker logs
./deploy.sh logs

# Or manually
docker-compose logs -f
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎉 Acknowledgments

- Material-UI for the beautiful UI components
- Prisma for the excellent ORM
- Socket.io for real-time capabilities
- The open-source community for various libraries and tools

---

**Built with ❤️ for construction companies worldwide**