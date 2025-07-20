# Construction SaaS Platform

A comprehensive construction management platform built with Node.js, Express, PostgreSQL, React, and Material-UI. This platform provides complete management solutions for construction companies, including machine management, personnel tracking, contract management, rental operations, and financial tracking.

## 🌟 Features

### Core Management Modules
- **Machine Management**: Track construction machines, their assignments, working hours, and maintenance schedules
- **Personnel Management**: Manage drivers, assistants, salaries, and work schedules with automated calculations
- **Contract Management**: Create and manage contracts, assign machines, and track project progress
- **Rental Operations**: Manage land, room, and parking rentals with payment tracking
- **Payment Management**: Track all payments, generate invoices, and manage financial records
- **Alert System**: Automated alerts for rent due, contract expiry, salary payments, and maintenance

### Advanced Features
- **Multi-language Support**: English, Dari (دری), and Pashto (پښتو)
- **Real-time Updates**: Socket.io integration for live notifications and dashboard updates
- **Automated Calculations**: Machine working hours, salary deductions, and rent payments
- **Role-based Access Control**: Secure authentication and authorization
- **Responsive Design**: Mobile-friendly interface with Material-UI
- **Scheduled Tasks**: Automated alerts and maintenance reminders using cron jobs

### Business Logic
- **30-day Month Calculation**: Fixed month calculation for consistent billing
- **Salary Management**: Partial payments, vacation tracking, and deductions for non-working days
- **Rent Payment Tracking**: Advance payments, due date alerts, and overdue management
- **Machine Hour Tracking**: Automated calculation of working hours per contract
- **Financial Reporting**: Comprehensive financial summaries and statistics

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd construction-saas
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy server environment file
   cd server
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Set up the database**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development servers**
   ```bash
   # Start server (from server directory)
   npm run dev
   
   # Start client (from client directory)
   npm start
   ```

### Environment Variables

#### Server (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/construction_saas"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload (optional)
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## 📁 Project Structure

```
construction-saas/
├── server/                 # Backend API
│   ├── prisma/            # Database schema and migrations
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic and cron jobs
│   │   └── lib/           # Utilities and configurations
│   └── package.json
├── client/                # Frontend React app
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store and slices
│   │   ├── locales/       # Translation files
│   │   └── utils/         # Utilities and helpers
│   └── package.json
└── docs/                  # Documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Machines
- `GET /api/machines` - Get all machines
- `POST /api/machines` - Create new machine
- `GET /api/machines/:id` - Get machine details
- `PUT /api/machines/:id` - Update machine
- `DELETE /api/machines/:id` - Delete machine
- `POST /api/machines/:id/assign` - Assign machine to driver
- `GET /api/machines/:id/hours` - Get machine working hours

### Drivers
- `GET /api/drivers` - Get all drivers
- `POST /api/drivers` - Create new driver
- `GET /api/drivers/:id` - Get driver details
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver
- `POST /api/drivers/:id/salary` - Process salary payment
- `GET /api/drivers/:id/assistants` - Get driver assistants

### Contracts
- `GET /api/contracts` - Get all contracts
- `POST /api/contracts` - Create new contract
- `GET /api/contracts/:id` - Get contract details
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract
- `POST /api/contracts/:id/machines` - Assign machines to contract
- `GET /api/contracts/:id/summary` - Get contract financial summary

### Rentals
- `GET /api/rentals/land` - Get land rentals
- `GET /api/rentals/rooms` - Get room rentals
- `POST /api/rentals` - Create new rental
- `PUT /api/rentals/:id` - Update rental
- `DELETE /api/rentals/:id` - Delete rental
- `POST /api/rentals/:id/payments` - Record rental payment

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create new payment
- `GET /api/payments/summary` - Get payment summary
- `GET /api/payments/statistics` - Get payment statistics

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/statistics` - Get dashboard statistics
- `GET /api/dashboard/trends` - Get financial trends

## 🎨 Frontend Components

### Core Components
- `LandingPage` - Public landing page with features and pricing
- `Layout` - Main application layout with navigation
- `Dashboard` - Overview dashboard with statistics and charts
- `MachineManagement` - Complete machine management interface
- `ProtectedRoute` - Authentication wrapper for protected routes

### Features
- **Responsive Design**: Mobile-first approach with Material-UI
- **Multi-language**: i18next integration with RTL support
- **Real-time Updates**: Socket.io client integration
- **State Management**: Redux Toolkit for global state
- **Form Validation**: Comprehensive form validation and error handling
- **Data Visualization**: Charts and progress indicators

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Role-based Access**: Granular permissions system
- **Input Validation**: Comprehensive server-side validation
- **Rate Limiting**: API rate limiting for security
- **CORS Configuration**: Secure cross-origin requests

## 📊 Database Schema

The platform uses PostgreSQL with Prisma ORM. Key entities include:

- **Users**: Authentication and user management
- **Machines**: Construction equipment tracking
- **Drivers**: Personnel management
- **DriverAssistants**: Assistant management
- **Contracts**: Project and contract management
- **ContractMachines**: Machine assignments to contracts
- **MachineAssignments**: Driver assignments to machines
- **MachineHours**: Working hour tracking
- **LandRentals**: Land rental management
- **RoomRentals**: Room rental management
- **Payments**: Financial transaction tracking
- **SalaryPayments**: Salary payment management
- **Alerts**: Notification and alert system

## 🚀 Deployment

### Production Build

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Set production environment**
   ```bash
   cd server
   NODE_ENV=production npm start
   ```

### Docker Deployment

```dockerfile
# Dockerfile for server
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="your-production-secret"
PORT=5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `docs/` folder

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks
- Database backups
- Log rotation
- Security updates
- Performance monitoring
- User feedback collection

### Scheduled Tasks
- Daily rent due alerts
- Weekly contract expiry notifications
- Monthly financial summaries
- Quarterly system cleanup

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Core CRUD operations
- ✅ Authentication and authorization
- ✅ Basic dashboard
- ✅ Multi-language support

### Phase 2 (Planned)
- 📊 Advanced reporting and analytics
- 📱 Mobile application
- 🔗 API integrations
- 📄 Document management

### Phase 3 (Future)
- 🤖 AI-powered insights
- 📊 Advanced analytics
- 🔗 Third-party integrations
- 🌐 Multi-tenant architecture

---

**Built with ❤️ for the construction industry**