# Truck Management System - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Core Features](#core-features)
4. [Technical Stack](#technical-stack)
5. [Database Design](#database-design)
6. [API Design](#api-design)
7. [Progressive Web App Features](#progressive-web-app-features)
8. [Development Roadmap](#development-roadmap)
9. [Security Considerations](#security-considerations)
10. [Deployment Strategy](#deployment-strategy)

## Project Overview

The Truck Management System is a Progressive Web Application (PWA) designed to help trucking companies manage their fleet operations efficiently. The system enables drivers to submit daily reports, track expenses, and manage truck assignments while providing managers with comprehensive reporting and analytics.

### Key Objectives
- **Offline-First**: Enable drivers to work without internet connectivity
- **Mobile-Friendly**: Installable PWA that works on smartphones and tablets
- **Real-time Sync**: Automatic synchronization when connectivity is restored
- **Comprehensive Reporting**: Detailed analytics and reporting capabilities
- **User-Friendly**: Simple interface for drivers and managers

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (PWA)         │◄──►│   (Express.js)  │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • Vanilla JS    │    │ • REST API      │    │ • Atlas Cloud   │
│ • IndexedDB     │    │ • JWT Auth      │    │ • Mongoose ODM  │
│ • Service Worker│    │ • Validation    │    │ • Document Store│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Project Structure
```
truck-management-pwa/
├── README.md
├── package.json
├── .env.example
├── server/                     # Node.js backend
│   ├── index.js               # Application entry point
│   ├── routes/                # API route definitions
│   │   ├── auth.js           # Authentication routes
│   │   ├── trucks.js         # Truck management routes
│   │   ├── drivers.js        # Driver management routes
│   │   └── drives.js         # Drive management routes
│   ├── controllers/           # Business logic controllers
│   │   ├── authController.js
│   │   ├── truckController.js
│   │   ├── driverController.js
│   │   └── driveController.js
│   ├── models/               # Database models
│   │   ├── Truck.js
│   │   ├── Driver.js
│   │   ├── Drive.js
│   │   └── User.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── services/             # Business services
│   │   ├── reportService.js
│   │   └── syncService.js
│   └── utils/                # Utility functions
│       ├── database.js
│       └── helpers.js
├── public/                   # Frontend static files
│   ├── index.html           # Main application page
│   ├── app.js               # Main application logic
│   ├── styles.css           # Application styles
│   ├── components/          # UI components
│   │   ├── truckForm.js
│   │   ├── driverForm.js
│   │   ├── driveForm.js
│   │   └── driveList.js
│   ├── services/            # Frontend services
│   │   ├── apiService.js
│   │   ├── syncService.js
│   │   └── storageService.js
│   ├── manifest.json        # PWA manifest
│   ├── service-worker.js    # PWA service worker
│   ├── idb.js               # IndexedDB helper
│   └── icons/               # PWA icons
└── scripts/
    └── seed.js              # Database seeding script
```

## Core Features

### 1. Fleet Management
**Description**: Complete truck fleet management system

**Features**:
- **Truck Registration**: Add new trucks with plate number, make, model
- **Fleet Overview**: View all trucks and their current status
- **Truck History**: Track truck usage and maintenance records
- **Drive Assignment**: Assign drivers to trucks when creating drives

**User Stories**:
- As a manager, I want to register new trucks in the system
- As a manager, I want to view the status of all trucks in the fleet
- As a manager, I want to assign drivers to trucks when creating drive records

### 2. Driver Management
**Description**: Comprehensive driver management and profile system

**Features**:
- **Driver Registration**: Add drivers with personal information
- **Driver Profiles**: Store contact information, national ID, unique phone numbers
- **Driver Performance**: Track driver performance and history
- **Optional Email**: Email address is optional for drivers

**User Stories**:
- As an admin, I want to register new drivers in the system
- As an admin, I want to view driver profiles and contact information
- As an admin, I want to track driver performance across all drives

### 3. Drive/TruckOperation System
**Description**: Core feature for recording individual truck operations/drives

**Features**:
- **Drive Recording**: Drivers can record individual drives/operations
- **Time Tracking**: Record start and end times for each drive
- **Revenue Tracking**: Record total revenue from each drive
- **Expense Management**: Track various types of expenses (fuel, maintenance, tolls)
- **Product Information**: Record what products were transported
- **Driver Assignment**: Assign drivers to trucks when creating drives
- **Optional Fields**: Distance, fuel consumption, load weight, and customer are optional
- **Location Tracking**: Record start and end locations

**User Stories**:
- As an admin, I want to record each drive for trucks in the system
- As an admin, I want to record revenue and expenses for each drive
- As an admin, I want to optionally track customer information and load details
- As an admin, I want to assign drivers to trucks when creating drive records

### 4. Offline Functionality
**Description**: Enable full functionality without internet connectivity

**Features**:
- **Offline Data Entry**: Create reports when offline
- **Local Storage**: Store data locally using IndexedDB
- **Sync Queue**: Queue operations for when connectivity is restored
- **Background Sync**: Automatic synchronization when online
- **Conflict Resolution**: Handle data conflicts during sync

**User Stories**:
- As an admin, I want to record drives even when I don't have internet
- As an admin, I want my offline drive records to sync automatically when I get online
- As an admin, I want to be notified if there are sync conflicts

### 5. Reporting and Analytics
**Description**: Comprehensive reporting and analytics dashboard

**Features**:
- **Drive Reports**: View drives by day, truck, or driver
- **Weekly Summaries**: Aggregate drive data by week
- **Monthly Reports**: Monthly performance summaries
- **Custom Date Ranges**: Generate reports for specific periods
- **Financial Analytics**: Revenue vs expenses analysis per drive
- **Driver Performance**: Track driver performance metrics
- **Customer Analytics**: Analyze customer patterns and profitability
- **Export Functionality**: Export drive records to CSV/Excel

**User Stories**:
- As a user, I want to view all drives for all trucks, per truck
- As a user, I want to see custom-date drive summaries, the balance(profits)
- As a user, I want to export drive records for accounting purposes
- As a user, I want to analyze profit and loss by truck, driver, customer, or destination
- As a user, I want to track driver performance metrics

### 6. Progressive Web App Features
**Description**: Modern PWA capabilities for mobile-first experience

**Features**:
- **Installable**: Can be installed on mobile devices like a native app
- **Offline Support**: Works without internet connection
- **Push Notifications**: Notify users of important updates
- **Responsive Design**: Works on all device sizes
- **Fast Loading**: Cached resources for quick loading

**User Stories**:
- As a user, I want to install the app on my phone
- As a user, I want the app to work quickly even on slow connections

### 7. Role-Based Access Control
**Description**: Comprehensive user management and security system

**Features**:
- **Two Roles**: Admin and User roles only
- **Admin-Only Registration**: Only admins can create new users
- **Default User Role**: All new registrations get "user" role by default
- **Default Admin**: System creates default admin on first setup
- **Email Verification**: Required for all email addresses
- **Role Management**: Admins can update user roles after registration
- **Account Management**: Admins can activate/deactivate accounts
- **Self-Protection**: Admins cannot deactivate themselves or demote themselves
- **Password Recovery**: Email-based password reset functionality
- **JWT Tokens**: Secure token-based authentication
- **Password Security**: Encrypted password storage

**User Stories**:
- As a system, I want to create a default admin account on first setup (credentials found in env variables)
- As an admin, I want to manage user roles and account status
- As an admin, I want to be protected from accidentally deactivating myself
- As a user, I want to verify my email address when I register
- As a user, I want to verify my email when I update it
- As a user, I want to reset my password via email
- As a user, I want to recover my account if I forget my password

## Technical Stack

### Backend Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL document database
- **Mongoose**: MongoDB object modeling for Node.js
- **JWT**: JSON Web Tokens for authentication
- **Express-validator**: Input validation middleware

### Frontend Technologies
- **Vanilla JavaScript**: No framework dependencies
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with flexbox/grid
- **IndexedDB**: Client-side database for offline storage
- **Service Workers**: Background scripts for PWA functionality
- **Web App Manifest**: PWA configuration

### Development Tools
- **Nodemon**: Development server with auto-restart
- **Dotenv**: Environment variable management
- **CORS**: Cross-origin resource sharing
- **Morgan**: HTTP request logger

## Database Design

### Data Models

#### Truck Model
```javascript
{
  plate: String,           // Unique truck plate number
  make: String,            // Truck manufacturer
  model: String,           // Truck model
  year: Number,            // Manufacturing year
  status: String,          // active, maintenance, retired
  createdAt: Date,
  updatedAt: Date
}
```

#### Driver Model
```javascript
{
  fullName: String,        // Driver's full name
  phone: String,           // Unique contact phone number
  email: String,           // Optional email address
  nationalId: String,      // National identification number
  licenseNumber: String,   // Driving license number
  address: String,         // Home address
  hireDate: Date,          // Date of employment
  status: String,          // active, inactive, suspended
  createdAt: Date,
  updatedAt: Date
}
```

#### Drive/TruckOperation Model
```javascript
{
  truck: ObjectId,         // Reference to truck
  driver: ObjectId,        // Reference to driver (assigned when drive is created)
  date: Date,              // Drive date (normalized to midnight)
  startTime: Date,         // Drive start time
  endTime: Date,           // Drive end time
  product: String,         // Product transported
  revenue: Number,         // Total revenue from this drive
  expenses: [{             // Array of expenses
    type: String,          // fuel, maintenance, toll, other
    amount: Number,        // Expense amount
    note: String,          // Expense description
    receipt: String        // Receipt reference (optional)
  }],
  startLocation: String,   // Starting location
  endLocation: String,     // Ending location
  customer: String,        // Optional: Customer/client name
  notes: String,           // Additional notes
  status: String,          // started, completed
  createdAt: Date,
  updatedAt: Date
}
```

#### User Model
```javascript
{
  username: String,        // Unique username
  email: String,           // Unique email
  phone: String,           // Unique phone number
  password: String,        // Hashed password
  role: String,            // admin, user
  isActive: Boolean,       // Account status
  isDefaultAdmin: Boolean, // Flag for default admin account
  emailVerified: Boolean,  // Email verification status
  emailVerificationToken: String,    // Email verification token
  emailVerificationExpires: Date,    // Email verification token expiration
  lastLogin: Date,         // Last login timestamp
  passwordResetToken: String,    // Password reset token
  passwordResetExpires: Date,    // Password reset token expiration
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes
- **Drive/TruckOperation**: Compound index on `{ truck: 1, date: 1 }` for efficient queries
- **Drive/TruckOperation**: Index on `date` for date-range queries
- **Drive/TruckOperation**: Index on `driver` for driver-specific queries
- **Truck**: Unique index on `plate`
- **Driver**: Unique index on `phone` and `nationalId`
- **User**: Unique index on `email`, `username`, and `phone`

## API Design

### Authentication Endpoints
```
POST /api/auth/register     # Admin-only user registration
POST /api/auth/login        # User login (email/phone + password)
POST /api/auth/logout       # User logout
GET  /api/auth/profile      # Get user profile
PUT  /api/auth/profile      # Update user profile
POST /api/auth/verify-email # Verify email address
POST /api/auth/resend-verification # Resend email verification
POST /api/auth/forgot-password  # Request password reset
POST /api/auth/reset-password   # Reset password with token
```

### Admin Management Endpoints
```
GET    /api/admin/users           # List all users (admin only)
POST   /api/admin/users           # Create new user (admin only)
PUT    /api/admin/users/:id       # Update user role/status (admin only)
DELETE /api/admin/users/:id       # Deactivate user (admin only)
POST   /api/admin/invite          # Invite user with role (admin only)
```

### Truck Management Endpoints
```
GET    /api/trucks          # List all trucks
POST   /api/trucks          # Create new truck
GET    /api/trucks/:id      # Get truck details
PUT    /api/trucks/:id      # Update truck
DELETE /api/trucks/:id      # Delete truck
GET    /api/trucks/:id/drives   # Get truck drives
```

### Driver Management Endpoints
```
GET    /api/drivers         # List all drivers
POST   /api/drivers         # Create new driver
GET    /api/drivers/:id     # Get driver details
PUT    /api/drivers/:id     # Update driver
DELETE /api/drivers/:id     # Delete driver
GET    /api/drivers/:id/drives   # Get driver drives
```

### Drive/TruckOperation Management Endpoints
```
GET    /api/drives          # List all drives (with filters)
POST   /api/drives          # Create single drive record
POST   /api/drives/batch    # Create multiple drives (sync)
GET    /api/drives/:id      # Get specific drive details
PUT    /api/drives/:id      # Update drive
DELETE /api/drives/:id      # Delete drive
```

### Drive Filtering Endpoints
```
GET    /api/drives/by-day/:date           # Get drives for specific day
GET    /api/drives/by-customer/:customer  # Get drives for specific customer
GET    /api/drives/date-range             # Get drives within date range
```

### Reports and Statistics Endpoints
```
GET    /api/reports/daily/:date           # Daily statistics report
GET    /api/reports/weekly/:week          # Weekly statistics report  
GET    /api/reports/monthly/:month        # Monthly statistics report
GET    /api/reports/custom                # Custom date range statistics
GET    /api/reports/summary               # Overall summary statistics
GET    /api/reports/export                # Export reports (CSV/Excel)
```

### Query Parameters for Drives
- `truckId`: Filter by specific truck
- `driverId`: Filter by specific driver
- `startDate`: Start date for date range
- `endDate`: End date for date range
- `status`: Filter by drive status (draft, submitted, approved, completed)
- `customer`: Filter by customer name
- `limit`: Number of results to return
- `offset`: Number of results to skip (for pagination)
- `sortBy`: Sort field (date, income, pay, distance)
- `sortOrder`: Sort direction (asc, desc)

### Query Parameters for Reports
- `truckId`: Filter statistics by specific truck
- `driverId`: Filter statistics by specific driver
- `startDate`: Start date for custom range
- `endDate`: End date for custom range
- `groupBy`: Group by day, week, month, truck, driver
- `includeExpenses`: Include expense breakdown (true/false)
- `format`: Export format (json, csv, excel)

## API Usage Examples

### Authentication

#### 1. Admin-Only User Registration
```http
POST /api/auth/register
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepassword123"
}
```

**Note**: All new registrations automatically get `role: "user"` by default. Only admins can change user roles after registration.

#### 2. User Login (Email or Phone)
```http
POST /api/auth/login
Content-Type: application/json

# Login with email
{
  "login": "john@example.com",
  "password": "securepassword123"
}

# OR login with phone
{
  "login": "+1234567890",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isActive": true
  }
}
```

#### 3. Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "user",
  "isActive": true,
  "lastLogin": "2024-01-15T10:30:00.000Z"
}
```

#### 4. Update User Profile
```http
PUT /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "email": "newemail@example.com",
  "phone": "+1987654321"
}
```

**Note**: If email is updated, user will receive a verification email and `emailVerified` will be set to `false` until verified.

#### 5. Verify Email Address
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "email-verification-token-from-email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### 6. Resend Email Verification
```http
POST /api/auth/resend-verification
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

#### 7. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### 8. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newsecurepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Admin Management

#### 1. List All Users (Admin Only)
```http
GET /api/admin/users
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "users": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "johndoe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user",
      "isActive": true,
      "isDefaultAdmin": false,
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 2. Create New User (Admin Only)
```http
POST /api/admin/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "username": "janedoe",
  "email": "jane@example.com",
  "phone": "+1987654321",
  "password": "securepassword123"
}
```

**Note**: All new users are created with `role: "user"` by default. Admins can change the role after creation.

#### 3. Update User Role/Status (Admin Only)
```http
PUT /api/admin/users/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "admin",
  "isActive": true
}
```

#### 4. Deactivate User (Admin Only)
```http
DELETE /api/admin/users/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

#### 5. Invite User (Admin Only)
```http
POST /api/admin/invite
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "message": "Welcome to our truck management system!"
}
```

**Note**: All invited users automatically get `role: "user"`. Admins can change the role after the user accepts the invitation.

**Response:**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "invitationToken": "invitation-token"
}
```

### Getting Drives

#### 1. List All Drives
```http
GET /api/drives
```
**Response:**
```json
{
  "drives": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "truck": "64f1a2b3c4d5e6f7g8h9i0j2",
      "driver": "64f1a2b3c4d5e6f7g8h9i0j3",
      "date": "2024-01-15T00:00:00.000Z",
      "startTime": "2024-01-15T08:00:00.000Z",
      "endTime": "2024-01-15T17:30:00.000Z",
      "product": "Construction Materials",
      "revenue": 500.00,
      "customer": "ABC Construction",
      "distance": 120,
      "fuelConsumption": 25.5,
      "loadWeight": 5000,
      "status": "completed"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### 2. List Drives Per Day
```http
GET /api/drives/by-day/2024-01-15
```
**Response:** Array of drives for that specific day

#### 3. List Drives Per Truck
```http
GET /api/trucks/64f1a2b3c4d5e6f7g8h9i0j2/drives
```
**Response:** Array of all drives for that truck

#### 4. List Drives Per Driver
```http
GET /api/drivers/64f1a2b3c4d5e6f7g8h9i0j3/drives
```
**Response:** Array of all drives for that driver

#### 5. List Drives with Filters
```http
GET /api/drives?startDate=2024-01-01&endDate=2024-01-31&truckId=64f1a2b3c4d5e6f7g8h9i0j2&status=completed
```

### Getting Reports and Statistics

#### 1. Daily Statistics Report
```http
GET /api/reports/daily/2024-01-15
```
**Response:**
```json
{
  "date": "2024-01-15",
  "summary": {
    "totalDrives": 5,
    "totalRevenue": 2500.00,
    "totalExpenses": 300.00,
    "netProfit": 2200.00,
    "totalDistance": 600,
    "totalFuelConsumption": 120.5,
    "averageDriveTime": 8.5
  },
  "byTruck": [
    {
      "truckId": "64f1a2b3c4d5e6f7g8h9i0j2",
      "truckPlate": "ABC-123",
      "drives": 3,
      "revenue": 1500.00,
      "expenses": 180.00
    }
  ],
  "byDriver": [
    {
      "driverId": "64f1a2b3c4d5e6f7g8h9i0j3",
      "driverName": "John Doe",
      "drives": 2,
      "hours": 16.5
    }
  ]
}
```

#### 2. Weekly Statistics Report
```http
GET /api/reports/weekly/2024-W03
```
**Response:**
```json
{
  "week": "2024-W03",
  "startDate": "2024-01-15",
  "endDate": "2024-01-21",
  "summary": {
    "totalDrives": 25,
    "totalRevenue": 12500.00,
    "totalExpenses": 1500.00,
    "netProfit": 11000.00,
    "totalDistance": 3000,
    "workingDays": 5
  },
  "dailyBreakdown": [
    {
      "date": "2024-01-15",
      "drives": 5,
      "revenue": 2500.00
    }
  ]
}
```

#### 3. Monthly Statistics Report
```http
GET /api/reports/monthly/2024-01
```
**Response:**
```json
{
  "month": "2024-01",
  "summary": {
    "totalDrives": 100,
    "totalRevenue": 50000.00,
    "totalExpenses": 6000.00,
    "netProfit": 44000.00,
    "totalDistance": 12000,
    "workingDays": 22
  },
  "weeklyBreakdown": [
    {
      "week": "2024-W01",
      "drives": 20,
      "revenue": 10000.00
    }
  ],
  "topCustomers": [
    {
      "customer": "ABC Construction",
      "drives": 15,
      "revenue": 7500.00
    }
  ]
}
```

#### 4. Custom Date Range Statistics
```http
GET /api/reports/custom?startDate=2024-01-01&endDate=2024-01-31&groupBy=day
```
**Response:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "groupBy": "day",
  "summary": {
    "totalDrives": 100,
    "totalRevenue": 50000.00,
    "totalExpenses": 6000.00,
    "netProfit": 44000.00
  },
  "breakdown": [
    {
      "date": "2024-01-01",
      "drives": 4,
      "revenue": 2000.00,
      "expenses": 240.00
    }
  ]
}
```

#### 5. Overall Summary Statistics
```http
GET /api/reports/summary
```
**Response:**
```json
{
  "overall": {
    "totalDrives": 500,
    "totalRevenue": 250000.00,
    "totalExpenses": 30000.00,
    "netProfit": 220000.00,
    "averageDriveValue": 500.00
  },
  "topPerformers": {
    "drivers": [
      {
        "driverId": "64f1a2b3c4d5e6f7g8h9i0j3",
        "driverName": "John Doe",
        "totalDrives": 50,
        "averageRating": 4.8
      }
    ],
    "trucks": [
      {
        "truckId": "64f1a2b3c4d5e6f7g8h9i0j2",
        "truckPlate": "ABC-123",
        "totalDrives": 45,
        "totalRevenue": 22500.00,
        "utilization": 85.5
      }
    ]
  }
}
```

#### 6. Export Reports
```http
GET /api/reports/export?startDate=2024-01-01&endDate=2024-01-31&format=csv&includeExpenses=true
```
**Response:** CSV file download with all drive data and statistics

## Frontend Pages and User Interface

### Authentication Pages
```
/login                    # Login page (email/phone + password)
/forgot-password          # Forgot password page
/reset-password/:token    # Reset password page (with token)
/invite/:token           # Accept invitation page
```

### Admin Pages
```
/admin/dashboard          # Admin dashboard with overview
/admin/users             # User management page
/admin/users/create      # Create new user page
/admin/users/:id/edit    # Edit user page
/admin/trucks            # Truck management page
/admin/trucks/create     # Create new truck page
/admin/trucks/:id/edit   # Edit truck page
/admin/drivers           # Driver management page
/admin/drivers/create    # Create new driver page
/admin/drivers/:id/edit  # Edit driver page
/admin/reports           # Reports and analytics page
/admin/settings          # System settings page
```

### User Pages
```
/dashboard               # User dashboard
/drives                  # All drives page (read-only)
/profile                 # User profile page
/profile/edit            # Edit profile page
```

### Shared Pages
```
/                        # Landing page (redirects based on role)
/offline                 # Offline indicator page
/error                   # Error page
/not-found              # 404 page
```

## Page Descriptions and Features

### Authentication Pages

#### `/login`
- **Purpose**: User authentication
- **Features**: 
  - Email or phone number input
  - Password field
  - "Remember me" checkbox
  - "Forgot password" link
  - Login button
  - Error message display
  - Email verification warning (if email not verified)
- **Validation**: Required fields, format validation
- **Redirect**: Based on user role after successful login

#### `/forgot-password`
- **Purpose**: Request password reset
- **Features**:
  - Email input field
  - Submit button
  - Success/error messages
  - Back to login link
- **Validation**: Valid email format required

#### `/reset-password/:token`
- **Purpose**: Reset password with token
- **Features**:
  - New password input
  - Confirm password input
  - Submit button
  - Token validation
  - Success/error messages
- **Validation**: Password strength, matching passwords

#### `/verify-email/:token`
- **Purpose**: Verify email address
- **Features**:
  - Email verification confirmation
  - Success/error messages
  - Redirect to login or dashboard
  - Token validation
- **Validation**: Valid verification token

#### `/invite/:token`
- **Purpose**: Accept admin invitation
- **Features**:
  - Display invitation details
  - Set username and password
  - Accept invitation button
  - Token validation
  - Email verification after registration
- **Validation**: Username uniqueness, password strength

### Admin Pages

#### `/admin/dashboard`
- **Purpose**: Admin overview and key metrics
- **Features**:
  - Total users count
  - Total trucks count
  - Total drives count
  - Recent activity feed
  - Quick action buttons
  - Charts and graphs
- **Data**: Real-time statistics and summaries

#### `/admin/users`
- **Purpose**: User management
- **Features**:
  - Users list with search/filter
  - User status indicators
  - Role badges
  - Action buttons (edit, deactivate)
  - Create new user button
  - Pagination
- **Actions**: View, edit, deactivate users

#### `/admin/users/create`
- **Purpose**: Create new user
- **Features**:
  - Username input
  - Email input
  - Phone input
  - Password input
  - Role selection (admin/user)
  - Submit/cancel buttons
- **Validation**: Unique fields, required fields

#### `/admin/users/:id/edit`
- **Purpose**: Edit user details
- **Features**:
  - Pre-filled form with user data
  - Role update dropdown
  - Active/inactive toggle
  - Save/cancel buttons
  - Delete user option (if not self)
- **Validation**: Cannot edit self role, cannot deactivate self

#### `/admin/trucks`
- **Purpose**: Truck fleet management
- **Features**:
  - Trucks list with search/filter
  - Truck status indicators
  - Plate number display
  - Action buttons (edit, delete)
  - Create new truck button
  - Truck utilization stats
- **Actions**: View, edit, delete trucks

#### `/admin/trucks/create`
- **Purpose**: Add new truck
- **Features**:
  - Plate number input
  - Make input
  - Model input
  - Year input
  - Status selection
  - Submit/cancel buttons
- **Validation**: Unique plate number, required fields

#### `/admin/drivers`
- **Purpose**: Driver management
- **Features**:
  - Drivers list with search/filter
  - Driver status indicators
  - Contact information display
  - Action buttons (edit, delete)
  - Create new driver button
  - Driver performance stats
- **Actions**: View, edit, delete drivers

#### `/admin/reports`
- **Purpose**: Analytics and reporting
- **Features**:
  - Date range picker
  - Filter options (truck, driver, customer)
  - Report type selection (daily, weekly, monthly)
  - Export options (CSV, Excel)
  - Charts and graphs
  - Summary statistics
- **Data**: Aggregated reports and analytics

### User Pages

#### `/dashboard`
- **Purpose**: User overview
- **Features**:
  - Recent drives list
  - Quick stats (total drives, revenue)
  - Quick action buttons
  - Recent activity feed
  - Offline status indicator
- **Data**: User-specific information only

#### `/drives`
- **Purpose**: All drive records (read-only)
- **Features**:
  - Drives list with search/filter
  - Drive status indicators
  - Date and time display
  - Revenue and expense summary
  - Action buttons (view only)
  - Offline sync status
- **Actions**: View drives only (read-only access)


#### `/profile`
- **Purpose**: User profile information
- **Features**:
  - Personal information display
  - Contact details
  - Account status
  - Email verification status
  - Last login information
  - Edit profile button
  - Change password option
  - Resend verification email button (if not verified)
- **Data**: User's own profile only

#### `/profile/edit`
- **Purpose**: Edit user profile
- **Features**:
  - Username input
  - Email input (triggers verification if changed)
  - Phone input
  - Save/cancel buttons
  - Change password section
  - Email verification warning (if email changed)
- **Validation**: Unique fields, format validation

### Shared Pages

#### `/` (Landing Page)
- **Purpose**: Entry point and role-based redirect
- **Features**:
  - Check authentication status
  - Redirect to appropriate dashboard
  - Loading indicator
- **Logic**: Redirect based on user role and authentication

#### `/offline`
- **Purpose**: Offline functionality indicator
- **Features**:
  - Offline status message
  - Queued actions display
  - Sync status indicator
  - Retry sync button
  - Continue offline option
- **Data**: Offline queue and sync status

#### `/error`
- **Purpose**: Error handling
- **Features**:
  - Error message display
  - Error code information
  - Retry button
  - Back to dashboard link
  - Contact support option
- **Types**: Network errors, server errors, validation errors

#### `/not-found`
- **Purpose**: 404 error page
- **Features**:
  - 404 message
  - Back to dashboard button
  - Search suggestion
  - Navigation menu
- **Design**: User-friendly error page

## Progressive Web App Features

### Service Worker Implementation
The service worker will handle:
- **Asset Caching**: Cache static files (HTML, CSS, JS, images)
- **API Caching**: Cache API responses for offline access
- **Background Sync**: Sync offline data when connectivity is restored
- **Push Notifications**: Handle push notifications
- **Update Management**: Handle app updates

### IndexedDB Schema
```javascript
// Offline storage structure
{
  drives: {
    keyPath: 'id',
    indexes: ['truckId', 'driverId', 'date', 'status', 'customer']
  },
  syncQueue: {
    keyPath: 'id',
    indexes: ['type', 'timestamp', 'status']
  },
  settings: {
    keyPath: 'key'
  }
}
```

### PWA Manifest
```json
{
  "name": "Truck Management System",
  "short_name": "TruckManager",
  "description": "Fleet management and daily reporting system",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1976d2",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```


## Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://user:password@cluster0.mongodb.net/truck_management?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Default Admin Configuration (Created on first startup)
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_EMAIL=admin@truckmanagement.com
DEFAULT_ADMIN_PHONE=+1234567890
DEFAULT_ADMIN_PASSWORD=AdminPassword123!

# Email Configuration (for password reset and invitations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@truckmanagement.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### Default Admin Account

The system automatically creates a default admin account on first startup using the environment variables above. This account:

- Has `isDefaultAdmin: true` flag
- Cannot be deactivated by other admins
- Is automatically disabled when another admin account is created
- Should be used to create the first real admin account

### Security Notes

- Change the default admin credentials in production
- Use strong, unique JWT secrets
- Configure proper SMTP settings for email functionality
- Set `NODE_ENV=production` in production environment

## Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Goal**: Set up basic project structure and core functionality

#### Week 1: Project Setup
- [ ] Initialize project structure
- [ ] Set up development environment
- [ ] Configure MongoDB Atlas
- [ ] Create basic Express server
- [ ] Set up authentication system
- [ ] Create basic HTML/CSS structure

#### Week 2: Core Models and API
- [ ] Implement Mongoose models (Truck, Driver, DailyReport, User)
- [ ] Create basic CRUD operations for trucks
- [ ] Create basic CRUD operations for drivers
- [ ] Implement JWT authentication
- [ ] Create basic frontend forms

### Phase 2: Core Features (Weeks 3-4)
**Goal**: Implement main application features

#### Week 3: Drive Recording System
- [ ] Implement drive record creation
- [ ] Create drive listing and filtering
- [ ] Add expense tracking functionality
- [ ] Implement basic drive dashboard

#### Week 4: User Interface
- [ ] Create responsive design
- [ ] Implement truck assignment functionality
- [ ] Add driver management interface
- [ ] Create drive management interface

### Phase 3: PWA Features (Weeks 5-6)
**Goal**: Add Progressive Web App capabilities

#### Week 5: Offline Functionality
- [ ] Implement IndexedDB storage
- [ ] Create service worker
- [ ] Add offline drive recording
- [ ] Implement sync queue system

#### Week 6: PWA Enhancement
- [ ] Add PWA manifest
- [ ] Implement background sync
- [ ] Add push notifications
- [ ] Test PWA installation

### Phase 4: Advanced Features (Weeks 7-8)
**Goal**: Add advanced reporting and analytics

#### Week 7: Reporting and Analytics
- [ ] Implement aggregated drive reports
- [ ] Add date range filtering
- [ ] Create export functionality
- [ ] Add financial analytics per drive

#### Week 8: Testing and Optimization
- [ ] Add comprehensive testing
- [ ] Optimize performance
- [ ] Add error handling
- [ ] Security audit

### Phase 5: Deployment and Launch (Weeks 9-10)
**Goal**: Deploy and launch the application

#### Week 9: Deployment Preparation
- [ ] Set up production environment
- [ ] Configure HTTPS
- [ ] Set up monitoring
- [ ] Create deployment scripts

#### Week 10: Launch and Documentation
- [ ] Deploy to production
- [ ] Create user documentation
- [ ] Train users
- [ ] Monitor and fix issues

## Security Considerations

### Authentication Security
- **JWT Access Tokens**: Secure token-based authentication
- **Password Hashing**: Use bcrypt for password encryption
- **Token Expiration**: Access tokens with configurable expiration
- **Rate Limiting**: Prevent brute force attacks
- **Flexible Login**: Support login with either email or phone number
- **Unique Identifiers**: Email, username, and phone are all unique

### Role-Based Access Control Rules

#### Admin Permissions
- ✅ Create new users (admin or user roles)
- ✅ Update any user's role (promote user to admin, demote admin to user)
- ✅ Activate/deactivate any user account
- ✅ View all users and their information
- ✅ Invite users via email
- ✅ Access all system features and data
- ❌ Cannot deactivate their own account
- ❌ Cannot demote themselves to user role
- ❌ Cannot deactivate the default admin account

#### User Permissions
- ✅ View all reports and drives (read-only access)
- ✅ View all trucks and drivers (read-only access)
- ✅ View and manage their own profile
- ✅ Reset their own password
- ❌ Cannot edit/delete any data (read-only access)
- ❌ Cannot create other users
- ❌ Cannot change other users' roles
- ❌ Cannot deactivate other accounts
- ❌ Cannot access admin management features

#### Default Admin Special Rules
- ✅ Has all admin permissions
- ✅ Cannot be deactivated by other admins
- ✅ Automatically disabled when another admin is created
- ✅ Used only for initial system setup

### Data Security
- **Input Validation**: Validate all user inputs
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Protection**: Sanitize user inputs
- **HTTPS**: Encrypt all communications

### API Security
- **CORS Configuration**: Proper cross-origin resource sharing
- **Authentication Middleware**: Protect all API endpoints
- **Role-Based Access**: Implement proper authorization
- **API Rate Limiting**: Prevent API abuse

## Deployment Strategy

### Development Environment
- **Local Development**: Node.js with nodemon
- **Database**: MongoDB Atlas free tier
- **Version Control**: Git with GitHub
- **Environment Variables**: .env files for configuration

### Production Environment
- **Hosting**: Render, Railway, or Heroku
- **Database**: MongoDB Atlas production cluster
- **CDN**: CloudFlare for static assets
- **Monitoring**: Application performance monitoring
- **Backup**: Automated database backups

### CI/CD Pipeline
- **Automated Testing**: Run tests on every commit
- **Code Quality**: ESLint and Prettier
- **Security Scanning**: Dependency vulnerability scanning
- **Automated Deployment**: Deploy on successful tests

## Conclusion

This technical documentation provides a comprehensive overview of the Truck Management System. The application is designed to be a modern, offline-capable Progressive Web App that serves the needs of trucking companies and their drivers.

The development roadmap is structured in phases to ensure steady progress and early delivery of core functionality. The system's architecture is designed to be scalable and maintainable, with clear separation of concerns and modern development practices.

Key success factors:
- **User Experience**: Simple, intuitive interface for drivers
- **Reliability**: Offline functionality ensures continuous operation
- **Performance**: Fast loading and responsive design
- **Security**: Robust authentication and data protection
- **Scalability**: Architecture that can grow with the business

The next step is to begin Phase 1 development, starting with project setup and basic functionality implementation.