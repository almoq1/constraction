# Construction SaaS Platform

A comprehensive construction management platform built with Node.js, Express, React, and TypeScript. This platform provides complete management solutions for construction companies, including machine management, personnel management, contract tracking, rental management, payment processing, and automated alerts.

## 🚀 Features

### Core Management Modules

#### 1. **Machine Management**
- Complete CRUD operations for construction machines
- Machine status tracking (active, inactive, maintenance, rented)
- Working hours tracking and assignment management
- Maintenance scheduling and history
- Machine utilization analytics
- Real-time status updates

#### 2. **Driver Management**
- Comprehensive driver profiles with contact information
- License and experience tracking
- Salary management and payment tracking
- Assistant management for each driver
- Vacation and sick leave tracking
- Working hours calculation
- Driver-machine assignments

#### 3. **Contract Management**
- Contract creation and management
- Client information tracking
- Machine assignments to contracts
- Progress tracking and milestone management
- Payment tracking (advance, progress, final)
- Contract status management (pending, active, completed, cancelled)
- Working hours vs required hours tracking

#### 4. **Rental Management**
- Land and room rental management
- Tenant assignment and information tracking
- Payment tracking and overdue management
- Rental status management (available, rented, maintenance, reserved)
- Size and location tracking
- Monthly rent calculations

#### 5. **Payment Management**
- Comprehensive payment tracking for all types
- Income and expense categorization
- Multiple payment methods (cash, bank transfer, check, credit card)
- Payment status tracking (paid, pending, overdue, cancelled)
- Due date management
- Financial reporting and analytics

#### 6. **Alerts Management**
- Automated alert system for various events
- Alert types: rent due, maintenance, contract deadlines, payment overdue
- Priority levels (low, medium, high, critical)
- Alert status management (active, acknowledged, resolved, dismissed)
- Email and SMS notification settings
- Action buttons for quick responses

#### 7. **Dashboard & Analytics**
- Real-time overview of all operations
- Key performance indicators
- Machine utilization metrics
- Contract performance tracking
- Recent payments and alerts
- Quick action buttons
- Responsive design with charts and graphs

#### 8. **User Profile & Settings**
- Comprehensive user profile management
- Multi-language support (English, Dari, Pashto)
- Theme customization (light, dark, auto)
- Notification preferences
- Security settings and password management
- Timezone and date format preferences
- Currency settings

### Technical Features

#### **Frontend (React + TypeScript)**
- Modern React with TypeScript for type safety
- Material-UI for consistent and beautiful UI components
- Redux Toolkit for state management
- React Router v6 for navigation
- i18next for internationalization
- Responsive design for all devices
- Real-time updates with Socket.io
- Form validation and error handling

#### **Backend (Node.js + Express)**
- RESTful API with comprehensive endpoints
- JWT-based authentication and authorization
- Role-based access control (admin, manager, operator)
- Prisma ORM for database management
- PostgreSQL database
- Real-time communication with Socket.io
- Automated cron jobs for alerts and maintenance
- File upload and management
- Comprehensive error handling and logging

#### **Database (PostgreSQL)**
- Well-designed schema with relationships
- Data integrity and constraints
- Efficient indexing for performance
- Audit trails and history tracking
- Backup and recovery procedures

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - UI components
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **i18next** - Internationalization
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **node-cron** - Scheduled tasks
- **bcryptjs** - Password hashing
- **multer** - File uploads

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Jest** - Testing framework
- **Docker** - Containerization

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v13 or higher)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd construction-saas-platform
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Setup

#### Backend Environment (.env)
```bash
cd server
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/construction_db"

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

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

#### Frontend Environment (.env)
```bash
cd client
cp .env.example .env
```

Edit the `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Database Setup

```bash
# Navigate to server directory
cd server

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

### 5. Start the Application

#### Development Mode

```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from client directory, in a new terminal)
cd client
npm start
```

#### Production Mode

```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

## 📁 Project Structure

```
construction-saas-platform/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store and slices
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── locales/       # Translation files
│   │   └── types/         # TypeScript type definitions
│   ├── package.json
│   └── tsconfig.json
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Prisma models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript type definitions
│   ├── prisma/            # Database schema and migrations
│   ├── uploads/           # File uploads
│   ├── package.json
│   └── tsconfig.json
├── docs/                  # Documentation
├── README.md
└── package.json
```

## 🔧 Configuration

### Database Configuration

The application uses PostgreSQL with Prisma ORM. The database schema is defined in `server/prisma/schema.prisma`.

### Authentication

JWT-based authentication is implemented with role-based access control:
- **Admin**: Full access to all features
- **Manager**: Access to management features
- **Operator**: Limited access to assigned resources

### File Uploads

File uploads are configured for:
- User avatars
- Machine images
- Contract documents
- Payment receipts

### Scheduled Tasks

Automated tasks run via node-cron:
- Daily rent payment reminders
- Weekly maintenance alerts
- Monthly salary calculations
- Contract deadline notifications

## 🧪 Testing

### Backend Testing

```bash
cd server
npm test
```

### Frontend Testing

```bash
cd client
npm test
```

### E2E Testing

```bash
npm run test:e2e
```

## 📊 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Machine Management

- `GET /api/machines` - Get all machines
- `POST /api/machines` - Create new machine
- `GET /api/machines/:id` - Get machine by ID
- `PUT /api/machines/:id` - Update machine
- `DELETE /api/machines/:id` - Delete machine
- `POST /api/machines/:id/assign` - Assign machine to contract

### Driver Management

- `GET /api/drivers` - Get all drivers
- `POST /api/drivers` - Create new driver
- `GET /api/drivers/:id` - Get driver by ID
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver
- `POST /api/drivers/:id/assistants` - Add assistant to driver

### Contract Management

- `GET /api/contracts` - Get all contracts
- `POST /api/contracts` - Create new contract
- `GET /api/contracts/:id` - Get contract by ID
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract
- `POST /api/contracts/:id/payments` - Add payment to contract

### Rental Management

- `GET /api/rentals` - Get all rentals
- `POST /api/rentals` - Create new rental
- `GET /api/rentals/:id` - Get rental by ID
- `PUT /api/rentals/:id` - Update rental
- `DELETE /api/rentals/:id` - Delete rental
- `POST /api/rentals/:id/tenants` - Assign tenant to rental

### Payment Management

- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create new payment
- `GET /api/payments/:id` - Get payment by ID
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Alerts Management

- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert
- `GET /api/alerts/:id` - Get alert by ID
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert
- `PUT /api/alerts/:id/status` - Update alert status

## 🌐 Internationalization

The application supports multiple languages:
- **English** (en)
- **Dari** (dr)
- **Pashto** (ps)

Translation files are located in `client/src/locales/`.

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- File upload security
- SQL injection prevention

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment

1. Build the frontend:
```bash
cd client
npm run build
```

2. Set up production environment variables
3. Run database migrations
4. Start the production server:
```bash
cd server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `docs/` folder

## 🔄 Updates and Maintenance

- Regular security updates
- Feature enhancements
- Bug fixes
- Performance improvements
- Database optimizations

## 📈 Roadmap

### Phase 1 (Completed)
- ✅ Core management modules
- ✅ User authentication and authorization
- ✅ Basic reporting and analytics
- ✅ Multi-language support
- ✅ Responsive design

### Phase 2 (Planned)
- 🔄 Advanced reporting and analytics
- 🔄 Mobile application
- 🔄 API integrations
- 🔄 Advanced automation
- 🔄 Machine learning features

### Phase 3 (Future)
- 📋 AI-powered insights
- 📋 Advanced scheduling algorithms
- 📋 IoT integration
- 📋 Blockchain for payments
- 📋 Advanced security features

---

**Built with ❤️ for the construction industry**