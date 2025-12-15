# Quick API Reference

## Base URL
```
http://localhost:5000
```

## Authentication

All protected routes require authentication. Credentials can be provided in **three ways**:

1. **Headers (Recommended for all requests):**
   ```
   X-User-Email: user@example.com
   X-User-Password: password123
   ```

2. **Query Parameters (Best for GET requests):**
   ```
   ?email=user@example.com&password=password123
   ```

3. **Request Body (For POST/PUT requests):**
   ```json
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

---

## Public Endpoints

### POST /auth/signup
Create new user account
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" | "owner" | "admin"
}
```

### POST /auth/login
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

## Hostel Endpoints (Authenticated)

### GET /hostels
Get all hostels (role-based)
- Students: Only verified
- Owners: Only their own
- Admins: All

**Authentication:** Use headers or query parameters
```
Headers: X-User-Email, X-User-Password
OR
Query: ?email=user@example.com&password=password123
```

### GET /hostels/search?city=Lahore&maxRent=15000&facility=Wifi
Search and filter hostels
- Query params: `city`, `maxRent`, `facility`

**Authentication:** Use headers or query parameters

### GET /hostels/:id
Get single hostel by ID

**Authentication:** Use headers or query parameters

### POST /hostels (Owner Only)
Create new hostel

**Headers:**
```
X-User-Email: owner@example.com
X-User-Password: password123
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Hostel Name",
  "address": "123 Street",
  "city": "Lahore",
  "rent": 12000,
  "facilities": "Wifi, AC"
}
```

### PUT /hostels/:id (Owner Only)
Update hostel (all fields optional)

**Headers:**
```
X-User-Email: owner@example.com
X-User-Password: password123
Content-Type: application/json
```

**Body:**
```json
{
  "rent": 15000
}
```

### DELETE /hostels/:id (Owner Only)
Delete hostel

**Headers:**
```
X-User-Email: owner@example.com
X-User-Password: password123
```

---

## Admin Endpoints (Admin Only)

### GET /admin/hostels
Get all hostels (verified & unverified)

**Authentication:** Use headers or query parameters

### PUT /admin/verify-hostel/:id
Verify hostel (make visible to students)

**Headers:**
```
X-User-Email: admin@example.com
X-User-Password: admin123
```

### PUT /admin/unverify-hostel/:id
Unverify hostel (hide from students)

**Headers:**
```
X-User-Email: admin@example.com
X-User-Password: admin123
```

---

## Review Endpoints

### POST /reviews (Student Only)
Create review

**Headers:**
```
X-User-Email: student@example.com
X-User-Password: password123
Content-Type: application/json
```

**Body:**
```json
{
  "hostel_id": 1,
  "rating": 5,
  "comment": "Great hostel!"
}
```

### GET /reviews/hostel/:hostelId
Get all reviews for a hostel (public)

### GET /reviews/student/:studentId
Get all reviews by a student (public)

---

## Role Permissions Summary

| Action | Student | Owner | Admin |
|--------|---------|-------|-------|
| View verified hostels | ✅ | ❌ | ✅ |
| View own hostels | ❌ | ✅ | ✅ |
| View all hostels | ❌ | ❌ | ✅ |
| Create hostel | ❌ | ✅ | ❌ |
| Update own hostel | ❌ | ✅ | ❌ |
| Delete own hostel | ❌ | ✅ | ❌ |
| Search hostels | ✅ | ✅ | ✅ |
| Add review | ✅ | ❌ | ❌ |
| Verify hostel | ❌ | ❌ | ✅ |
| Unverify hostel | ❌ | ❌ | ✅ |


