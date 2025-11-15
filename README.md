# MIC Employee Leave Management System (MIC-ELMS)

![MIC-ELMS Logo](./frontend/src/logo/image.png)
<br>
**Live Link**: https://mic-employee-leave-management-syste-ebon.vercel.app/
<br>
**Demo Credentials:** 
<br>
**Email :** admin@mic.edu
<br>
**Password:** password123
## 📱 Mobile-Friendly Employee Leave Management System

A comprehensive and responsive web application for managing employee leave requests, designed specifically for educational institutions. The system features role-based access control with separate interfaces for administrators, department heads (HODs), and employees.

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://mic-employee-leave-management-syste-ebon.vercel.app/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18.2-blue)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green)](https://nodejs.org/)

## 🌟 Features

### User Authentication & Management
- Secure JWT-based authentication system
- Role-based access control (Admin, HOD, Employee)
- Profile management with avatar upload
- Password reset functionality

### Leave Management
- Intuitive leave application interface
- Document attachment support
- Multi-level approval workflow (HOD → Admin)
- Real-time status updates
- Leave balance tracking by category

### Department Administration
- Department-wise employee management
- HOD assignment and management
- Department-specific leave policies

### Analytics & Reporting
- Dashboard with key metrics and visualizations
- Excel report export functionality
- Customizable date range filtering
- Leave statistics by department and category

### Mobile Optimization
- Responsive design for all device sizes
- Mobile-optimized navigation
- Touch-friendly UI components
- Adaptive tables for small screens

## 🏗️ System Architecture

### Frontend
- **Framework**: React 18 with hooks and context API
- **Routing**: React Router 6
- **Styling**: Tailwind CSS with custom components
- **State Management**: Context API with local storage persistence
- **HTTP Client**: Axios with interceptors

### Backend
- **Server**: Node.js with Express
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT with secure HTTP-only cookies
- **File Storage**: Base64 encoding for profile pictures and attachments
- **API Documentation**: Swagger UI (available at /api-docs endpoint)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas connection)
- npm or yarn

### Installation

#### Clone the repository
```bash
git clone https://github.com/yourusername/MIC-ELMS.git
cd MIC-ELMS
```

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create config.env file in the backend directory with the following variables:
# PORT=5000
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret_key
# JWT_EXPIRE=30d
# NODE_ENV=development

# Run database seeder (optional, for test data)
npm run seed

# Start backend server
npm start
```

#### Frontend Setup
```bash
# Navigate to frontend directory from project root
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Default Admin Credentials
```
Email: admin@mic.edu
Password: password123
```

## 📱 Mobile Responsiveness

MIC-ELMS is fully responsive across all device sizes:

- **Desktop**: Full-featured interface with optimized layouts
- **Tablet**: Adapted navigation and card layouts
- **Mobile**: Touch-optimized buttons, collapsible tables, and custom navigation

Key mobile features include:
- Custom mobile navigation menu
- Responsive data tables that adapt to screen size
- Touch-friendly form inputs and buttons
- Optimized dashboard layout for small screens

## 🔐 Security Features

- JWT token authentication with automatic renewal
- Password hashing using bcrypt
- Protected routes on both frontend and backend
- CORS protection with whitelisted origins
- Rate limiting to prevent brute force attacks
- Input validation and sanitization
- Security headers with Helmet.js

## 🚢 Deployment

### Vercel Deployment

The application is configured for deployment on Vercel:

1. **Backend Deployment**
   - Vercel.json configuration included for serverless functions
   - API routes optimized for serverless architecture
   - CORS configured for secure cross-origin requests

2. **Frontend Deployment**
   - Build optimized for production with Vite
   - Environment variables for API connections
   - Configured for static site hosting

### Environment Variables

#### Backend (.env or config.env)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
NODE_ENV=production
CORS_ORIGIN=your_frontend_url
```

#### Frontend (.env)
```
VITE_API_URL=your_backend_api_url
```

## 📊 API Documentation

The MIC-ELMS API provides the following main endpoints:

- **Authentication**: `/api/auth` - Login, register, profile
- **Users**: `/api/users` - User management
- **Leaves**: `/api/leaves` - Leave application and approval
- **Departments**: `/api/departments` - Department management
- **Dashboard**: `/api/dashboard` - Analytics and statistics
- **Excel**: `/api/excel` - Report generation

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🔄 Workflow

1. **Employee**: Submits leave application → Uploads supporting documents → Views status
2. **HOD**: Reviews department leave requests → Approves/Rejects → Manages department employees
3. **Admin**: Final approval of leave requests → Manages all employees → Configures system settings → Generates reports

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍💻 Developers

- Team MIC - Developed for educational institutions to streamline leave management processes




