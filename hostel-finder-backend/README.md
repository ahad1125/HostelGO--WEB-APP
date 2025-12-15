# Hostel Finder Backend API

A RESTful backend API for a Hostel Search and Management System built with Node.js, Express.js, and SQLite.

## 📋 Project Overview

This is a backend prototype for a university project that allows:
- **Students** to search and view verified hostels, add reviews
- **Hostel Owners** to create, update, and delete their hostel listings
- **Admins** to verify/unverify hostels, controlling visibility to students

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database (single `.db` file)
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
hostel-finder-backend/
├── server.js                 # Main server file
├── database.js               # Database connection and schema
├── package.json             # Dependencies and scripts
├── hostel.db                # SQLite database file (auto-created)
│
├── controllers/             # Business logic
│   ├── authController.js    # Authentication (signup, login)
│   ├── hostelController.js  # Hostel CRUD operations
│   ├── adminController.js   # Admin verification operations
│   └── reviewController.js  # Review management
│
├── routes/                  # API route definitions
│   ├── auth.js             # Authentication routes
│   ├── hostel.js           # Hostel routes
│   ├── admin.js            # Admin routes
│   └── review.js           # Review routes
│
└── middleware/             # Custom middleware
    └── authMiddleware.js   # Authentication & role-based access
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   The server will start on `http://localhost:5000`

3. **Verify it's running:**
   ```bash
   curl http://localhost:5000
   ```
   Or open in browser: `http://localhost:5000`

## 📊 Database Schema

### Tables

1. **users** - User accounts
   - `id` (PRIMARY KEY)
   - `name` (TEXT)
   - `email` (TEXT, UNIQUE)
   - `password` (TEXT) - *Plain text for prototype*
   - `role` (TEXT) - *'student', 'owner', or 'admin'*

2. **hostels** - Hostel listings
   - `id` (PRIMARY KEY)
   - `name` (TEXT)
   - `address` (TEXT)
   - `city` (TEXT)
   - `rent` (INTEGER)
   - `facilities` (TEXT)
   - `owner_id` (INTEGER, FOREIGN KEY → users.id)
   - `is_verified` (INTEGER) - *0 = unverified, 1 = verified*

3. **reviews** - Student reviews
   - `id` (PRIMARY KEY)
   - `rating` (INTEGER, 1-5)
   - `comment` (TEXT)
   - `hostel_id` (INTEGER, FOREIGN KEY → hostels.id)
   - `student_id` (INTEGER, FOREIGN KEY → users.id)

4. **bookings** - Booking records
   - `id` (PRIMARY KEY)
   - `hostel_id` (INTEGER, FOREIGN KEY → hostels.id)
   - `student_id` (INTEGER, FOREIGN KEY → users.id)
   - `status` (TEXT) - *'pending', 'confirmed', 'cancelled'*

## 🔐 Authentication

**Note:** This prototype uses plain-text password storage and simple email/password authentication. No JWT or sessions are used. For production, always use password hashing and secure authentication.

All protected routes require authentication. Credentials can be provided in **three ways**:

1. **Headers (Recommended):**
   ```
   X-User-Email: user@example.com
   X-User-Password: password123
   ```
   Works for all request types (GET, POST, PUT, DELETE)

2. **Query Parameters:**
   ```
   ?email=user@example.com&password=password123
   ```
   Best for GET requests

3. **Request Body:**
   ```json
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```
   Works for POST/PUT requests

## 📡 API Endpoints

### Authentication Routes (Public)

#### 1. Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

#### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

### Hostel Routes (Authenticated)

**Note:** All hostel routes require authentication. Use headers (recommended) or query parameters for GET requests.

#### 3. Get All Hostels
```http
GET /hostels
X-User-Email: john@example.com
X-User-Password: password123
```

**OR using query parameters:**
```http
GET /hostels?email=john@example.com&password=password123
```

**Role-based behavior:**
- **Students:** Only verified hostels
- **Owners:** Only their own hostels
- **Admins:** All hostels

#### 4. Search & Filter Hostels ⭐
```http
GET /hostels/search?city=Lahore&maxRent=15000&facility=Wifi
X-User-Email: john@example.com
X-User-Password: password123
```

**Query Parameters:**
- `city` - Filter by city name (exact match)
- `maxRent` - Maximum rent amount
- `facility` - Partial match on facilities string

**Examples:**
- `/hostels/search?city=Lahore&email=john@example.com&password=password123`
- `/hostels/search?maxRent=15000&email=john@example.com&password=password123`
- `/hostels/search?city=Lahore&maxRent=15000&facility=Wifi&email=john@example.com&password=password123`

#### 5. Get Hostel by ID
```http
GET /hostels/1
X-User-Email: john@example.com
X-User-Password: password123
```

#### 6. Create Hostel (Owner Only)
```http
POST /hostels
Content-Type: application/json
X-User-Email: owner@example.com
X-User-Password: password123

{
  "name": "Luxury Hostel",
  "address": "123 Main Street",
  "city": "Lahore",
  "rent": 12000,
  "facilities": "Wifi, AC, Laundry"
}
```

**Response:**
```json
{
  "message": "Hostel created successfully (pending verification)",
  "hostel": {
    "id": 1,
    "name": "Luxury Hostel",
    "address": "123 Main Street",
    "city": "Lahore",
    "rent": 12000,
    "facilities": "Wifi, AC, Laundry",
    "owner_id": 2,
    "is_verified": 0
  }
}
```

#### 7. Update Hostel (Owner Only, Own Hostels)
```http
PUT /hostels/1
Content-Type: application/json

{
  "email": "owner@example.com",
  "password": "password123",
  "rent": 15000,
  "facilities": "Wifi, AC, Laundry, Parking"
}
```

**Note:** All fields are optional. Only include fields you want to update.

#### 8. Delete Hostel (Owner Only, Own Hostels) ⭐
```http
DELETE /hostels/1
Content-Type: application/json

{
  "email": "owner@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Hostel deleted successfully"
}
```

---

### Admin Routes (Admin Only)

#### 9. Get All Hostels (Admin View)
```http
GET /admin/hostels
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Shows all hostels (verified and unverified).

#### 10. Verify Hostel ⭐
```http
PUT /admin/verify-hostel/1
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Hostel verified successfully",
  "hostel": {
    "id": 1,
    "name": "Luxury Hostel",
    "is_verified": 1
  }
}
```

#### 11. Unverify Hostel ⭐
```http
PUT /admin/unverify-hostel/1
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Hostel unverified successfully",
  "hostel": {
    "id": 1,
    "name": "Luxury Hostel",
    "is_verified": 0
  }
}
```

---

### Review Routes

#### 12. Create Review (Student Only)
```http
POST /reviews
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "hostel_id": 1,
  "rating": 5,
  "comment": "Great hostel with excellent facilities!"
}
```

**Response:**
```json
{
  "message": "Review created successfully",
  "review": {
    "id": 1,
    "rating": 5,
    "comment": "Great hostel with excellent facilities!",
    "hostel_id": 1,
    "student_id": 1
  }
}
```

#### 13. Get Reviews by Hostel
```http
GET /reviews/hostel/1
```

**Response:**
```json
[
  {
    "id": 1,
    "rating": 5,
    "comment": "Great hostel!",
    "hostel_id": 1,
    "student_id": 1,
    "student_name": "John Doe"
  }
]
```

#### 14. Get Reviews by Student
```http
GET /reviews/student/1
```

---

## 🧪 Example API Requests (Using cURL)

### 1. Create a Student Account
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Student",
    "email": "alice@example.com",
    "password": "alice123",
    "role": "student"
  }'
```

### 2. Create an Owner Account
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Owner",
    "email": "bob@example.com",
    "password": "bob123",
    "role": "owner"
  }'
```

### 3. Create an Admin Account
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### 4. Owner Creates a Hostel
```bash
curl -X POST http://localhost:5000/hostels \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com",
    "password": "bob123",
    "name": "Comfort Hostel",
    "address": "456 University Road",
    "city": "Lahore",
    "rent": 10000,
    "facilities": "Wifi, AC, Laundry, Parking"
  }'
```

### 5. Admin Verifies Hostel
```bash
curl -X PUT http://localhost:5000/admin/verify-hostel/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### 6. Student Searches Hostels
```bash
curl -X GET "http://localhost:5000/hostels/search?city=Lahore&maxRent=15000" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "alice123"
  }'
```

### 7. Student Adds Review
```bash
curl -X POST http://localhost:5000/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "alice123",
    "hostel_id": 1,
    "rating": 4,
    "comment": "Good value for money"
  }'
```

### 8. Owner Deletes Hostel
```bash
curl -X DELETE http://localhost:5000/hostels/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com",
    "password": "bob123"
  }'
```

---

## 🔑 Role-Based Access Control

### Student
- ✅ View verified hostels only
- ✅ Search and filter verified hostels
- ✅ Add reviews to verified hostels
- ❌ Cannot create/edit/delete hostels
- ❌ Cannot verify hostels

### Hostel Owner
- ✅ Create hostel listings
- ✅ View own hostels only
- ✅ Update own hostels
- ✅ Delete own hostels
- ❌ Cannot view other owners' hostels
- ❌ Cannot verify hostels

### Admin
- ✅ View all hostels (verified & unverified)
- ✅ Verify hostels
- ✅ Unverify hostels
- ❌ Cannot create/edit/delete hostels (unless they're also an owner)

---

## 📝 Important Notes

1. **Password Storage:** Passwords are stored in plain text for this prototype. In production, always use password hashing (bcrypt).

2. **Authentication:** No JWT or sessions. Each request requires email/password in the body.

3. **Database:** SQLite database file (`hostel.db`) is created automatically on first run.

4. **CORS:** CORS is enabled for all origins. Adjust in production.

5. **Error Handling:** All endpoints return appropriate HTTP status codes and error messages.

---

## 🎓 For Viva/Explanation

### Key Features to Explain:

1. **Database Schema:** Explain the 4 tables and their relationships (foreign keys).

2. **Role-Based Access:** How different roles see different data:
   - Students: Only verified hostels
   - Owners: Only their own hostels
   - Admins: All hostels

3. **Search & Filtering:** SQL WHERE clauses with query parameters.

4. **Verification System:** How `is_verified` flag controls visibility to students.

5. **CRUD Operations:** How owners can create, read, update, and delete their hostels.

6. **Middleware:** How authentication and role checking works.

---

## 🐛 Troubleshooting

### Server won't start
- Check if port 5000 is already in use
- Ensure Node.js is installed: `node --version`
- Install dependencies: `npm install`

### Database errors
- Delete `hostel.db` and restart server (will recreate tables)
- Check file permissions

### Authentication fails
- Ensure email and password are correct
- Check that user exists in database

---

## 📄 License

This is an academic project prototype.

---

## 👨‍💻 Development Notes

- Code is commented for educational purposes
- Simple patterns used for beginner understanding
- No advanced frameworks or patterns
- Easy to explain in viva/presentation


