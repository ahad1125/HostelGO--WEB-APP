# 🏠 HostelGo - Student Hostel Finder Platform

A full-stack web application for finding and managing student hostels. Built with React, Node.js, and MySQL, featuring role-based access control for Students, Hostel Owners, and Administrators.

![HostelGo](https://img.shields.io/badge/HostelGo-Student%20Hostel%20Finder-blue)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)

## ✨ Features

### 👨‍🎓 For Students
- **Browse Verified Hostels** - View only admin-verified hostel listings
- **Advanced Search** - Filter by city, rent budget, and facilities
- **Read & Write Reviews** - Share experiences and read authentic student reviews
- **Send Enquiries** - Contact hostel owners directly
- **Schedule Visits** - Book appointments to visit hostels

### 🏢 For Hostel Owners
- **List Properties** - Add and manage hostel listings
- **Dashboard** - View all your hostels in one place
- **Manage Details** - Update hostel information anytime
- **Track Enquiries** - Respond to student enquiries and schedule visits
- **Verification Status** - Monitor verification progress

### 👨‍💼 For Administrators
- **Verify Hostels** - Review and approve hostel submissions
- **Manage All Listings** - View and manage all hostels on the platform
- **Analytics Dashboard** - Monitor platform activity
- **User Management** - Oversee all users and their activities

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Beautiful component library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Next Themes** - Dark/Light mode support
- **Embla Carousel** - Smooth carousel component

### Backend
- **Node.js** with Express.js
- **MySQL** - Relational database
- **mysql2/promise** - Async MySQL client
- **CORS** - Cross-origin resource sharing
- **JWT-like Authentication** - Custom header-based auth

### Architecture
- **MVC Pattern** - Model-View-Controller architecture
- **RESTful API** - Clean API design
- **Role-Based Access Control** - Secure permission system

## 📁 Project Structure

```
Hostel Finder/
├── hostel-finder-frontend/     # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/              # Page components
│   │   │   ├── admin/          # Admin pages
│   │   │   ├── owner/          # Owner pages
│   │   │   ├── student/        # Student pages
│   │   │   └── auth/           # Authentication pages
│   │   ├── contexts/           # React contexts
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/                # Utilities and API client
│   └── package.json
│
├── hostel-finder-backend/       # Node.js backend API
│   ├── config/                 # Configuration files
│   │   └── database.js         # Database connection
│   ├── controllers/            # Request handlers
│   ├── models/                 # Data models
│   ├── routes/                 # API routes
│   ├── middleware/             # Express middleware
│   ├── seed-data.sql           # Database seed data
│   └── server.js               # Entry point
│
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hostel-finder.git
   cd hostel-finder
   ```

2. **Install Backend Dependencies**
   ```bash
   cd hostel-finder-backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../hostel-finder-frontend
   npm install
   ```

### Environment Variables

#### Backend (`.env` in `hostel-finder-backend/`)
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hostel_finder
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS (Optional - for production)
FRONTEND_URL=http://localhost:8080
```

#### Frontend (`.env` in `hostel-finder-frontend/`)
```env
VITE_API_URL=http://localhost:5000
```

### Database Setup

1. **Create MySQL Database**
   ```sql
   CREATE DATABASE hostel_finder;
   ```

2. **Run Seed Data (Optional)**
   ```bash
   mysql -u root -p hostel_finder < hostel-finder-backend/seed-data.sql
   ```
   
   Or manually import `seed-data.sql` through MySQL Workbench/phpMyAdmin.

3. **Database Tables** - Tables are automatically created on server start:
   - `users` - User accounts (students, owners, admins)
   - `hostels` - Hostel listings
   - `reviews` - Student reviews
   - `enquiries` - Student enquiries
   - `bookings` - Booking records

### Running the Application

#### Development Mode

1. **Start Backend Server**
   ```bash
   cd hostel-finder-backend
   npm start
   ```
   Server runs on `http://localhost:5000`

2. **Start Frontend Development Server**
   ```bash
   cd hostel-finder-frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:8080`

#### Production Build

1. **Build Frontend**
   ```bash
   cd hostel-finder-frontend
   npm run build
   ```

2. **Start Backend**
   ```bash
   cd hostel-finder-backend
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login

### Hostels
- `GET /hostels/public` - Get verified hostels (public)
- `GET /hostels` - Get hostels (role-based)
- `GET /hostels/:id` - Get hostel details
- `GET /hostels/search` - Search hostels
- `POST /hostels` - Create hostel (owners only)
- `PUT /hostels/:id` - Update hostel (owners only)
- `DELETE /hostels/:id` - Delete hostel (owners only)

### Reviews
- `POST /reviews` - Create review (students only)
- `GET /reviews/hostel/:hostelId` - Get reviews for hostel
- `PUT /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

### Enquiries
- `POST /enquiries` - Create enquiry (students only)
- `GET /enquiries/owner` - Get owner's enquiries
- `GET /enquiries/student` - Get student's enquiries
- `PUT /enquiries/:id/reply` - Reply to enquiry (owners only)

### Admin
- `GET /admin/hostels` - Get all hostels
- `PUT /admin/verify-hostel/:id` - Verify hostel
- `PUT /admin/unverify-hostel/:id` - Unverify hostel

## 🎨 Features Showcase

### 🎯 Smart Search
Filter hostels by city, maximum rent, and facilities with an intuitive search interface.

### ✅ Verified Listings
All hostels are verified by administrators before being visible to students, ensuring authenticity.

### ⭐ Student Reviews
Read and write genuine reviews from fellow students to make informed decisions.

### 🌓 Dark Mode
Beautiful dark/light theme toggle with smooth transitions.

### 📱 Responsive Design
Fully responsive design that works seamlessly on desktop, tablet, and mobile devices.

## 🚢 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com`

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Set root directory: `hostel-finder-backend`
3. Add environment variables:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
   - `PORT` (auto-set by Railway)
   - `NODE_ENV=production`

### Database (Railway MySQL)
1. Create MySQL service on Railway
2. Copy connection variables to backend environment variables
3. Database tables are auto-created on first deployment

## 👥 Default Accounts

After seeding the database, you can use:

- **Admin**: `admin.pk@example.com` / `admin123`
- **Student**: Create via signup
- **Owner**: Create via signup

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ for students finding their perfect home away from home**

