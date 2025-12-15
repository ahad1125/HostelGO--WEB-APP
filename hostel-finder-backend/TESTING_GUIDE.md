# Backend Testing Guide

This guide shows you how to test the Hostel Finder Backend API locally.

## Prerequisites

1. Make sure the server is running:
   ```bash
   npm start
   ```
   You should see: `Server started on port 5000`

2. The server will be available at: `http://localhost:5000`

---

## Testing Methods

### Option 1: Using cURL (Command Line)

#### 1. Test Server Health
```bash
curl http://localhost:5000
```

#### 2. Create a User (Signup)

**Student:**
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"pass123\",\"role\":\"student\"}"
```

**Owner:**
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Jane Owner\",\"email\":\"owner@example.com\",\"password\":\"pass123\",\"role\":\"owner\"}"
```

**Admin:**
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Admin User\",\"email\":\"admin@example.com\",\"password\":\"admin123\",\"role\":\"admin\"}"
```

#### 3. Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"pass123\"}"
```

#### 4. Get All Hostels (GET request - using headers)

**Using Headers (Recommended):**
```bash
curl -X GET http://localhost:5000/hostels \
  -H "X-User-Email: john@example.com" \
  -H "X-User-Password: pass123"
```

**Using Query Parameters:**
```bash
curl -X GET "http://localhost:5000/hostels?email=john@example.com&password=pass123"
```

#### 5. Create a Hostel (Owner only)
```bash
curl -X POST http://localhost:5000/hostels \
  -H "Content-Type: application/json" \
  -H "X-User-Email: owner@example.com" \
  -H "X-User-Password: pass123" \
  -d "{\"name\":\"Luxury Hostel\",\"address\":\"123 Main St\",\"city\":\"Lahore\",\"rent\":12000,\"facilities\":\"Wifi, AC\"}"
```

#### 6. Search Hostels
```bash
curl -X GET "http://localhost:5000/hostels/search?city=Lahore&maxRent=15000" \
  -H "X-User-Email: john@example.com" \
  -H "X-User-Password: pass123"
```

#### 7. Get Hostel by ID
```bash
curl -X GET http://localhost:5000/hostels/1 \
  -H "X-User-Email: john@example.com" \
  -H "X-User-Password: pass123"
```

#### 8. Admin: Verify a Hostel
```bash
curl -X PUT http://localhost:5000/admin/verify-hostel/1 \
  -H "X-User-Email: admin@example.com" \
  -H "X-User-Password: admin123"
```

#### 9. Create a Review (Student only)
```bash
curl -X POST http://localhost:5000/reviews \
  -H "Content-Type: application/json" \
  -H "X-User-Email: john@example.com" \
  -H "X-User-Password: pass123" \
  -d "{\"hostel_id\":1,\"rating\":5,\"comment\":\"Great hostel!\"}"
```

#### 10. Get Reviews for a Hostel
```bash
curl -X GET http://localhost:5000/reviews/hostel/1
```

---

### Option 2: Using Postman

1. **Install Postman** (if not already installed): https://www.postman.com/downloads/

2. **Create a new Collection** called "Hostel Finder API"

3. **Add requests** for each endpoint:

#### Example: GET /hostels with Headers

- **Method:** GET
- **URL:** `http://localhost:5000/hostels`
- **Headers:**
  - `X-User-Email: john@example.com`
  - `X-User-Password: pass123`

#### Example: POST /auth/signup

- **Method:** POST
- **URL:** `http://localhost:5000/auth/signup`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "pass123",
    "role": "student"
  }
  ```

#### Example: POST /hostels (Owner)

- **Method:** POST
- **URL:** `http://localhost:5000/hostels`
- **Headers:**
  - `Content-Type: application/json`
  - `X-User-Email: owner@example.com`
  - `X-User-Password: pass123`
- **Body (raw JSON):**
  ```json
  {
    "name": "Luxury Hostel",
    "address": "123 Main Street",
    "city": "Lahore",
    "rent": 12000,
    "facilities": "Wifi, AC, Laundry"
  }
  ```

---

### Option 3: Using Browser (for GET requests only)

For simple GET requests, you can use query parameters:

```
http://localhost:5000/hostels?email=john@example.com&password=pass123
```

```
http://localhost:5000/reviews/hostel/1
```

---

### Option 4: Using PowerShell (Windows)

**Signup:**
```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "pass123"
    role = "student"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/auth/signup" -Method POST -Body $body -ContentType "application/json"
```

**GET with Headers:**
```powershell
$headers = @{
    "X-User-Email" = "john@example.com"
    "X-User-Password" = "pass123"
}

Invoke-RestMethod -Uri "http://localhost:5000/hostels" -Method GET -Headers $headers
```

**GET with Query Parameters:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/hostels?email=john@example.com&password=pass123" -Method GET
```

---

## Authentication Methods

The API now accepts credentials in three ways (in order of preference):

1. **Headers (Recommended):**
   - `X-User-Email: user@example.com`
   - `X-User-Password: password123`
   - Works for ALL request types (GET, POST, PUT, DELETE)

2. **Query Parameters:**
   - `?email=user@example.com&password=password123`
   - Best for GET requests

3. **Request Body:**
   - `{ "email": "user@example.com", "password": "password123" }`
   - Works for POST/PUT requests

---

## Complete Testing Flow

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Create test users:**
   - Create a student user
   - Create an owner user
   - Create an admin user

3. **Test as Owner:**
   - Create a hostel (POST /hostels)
   - View your hostels (GET /hostels)

4. **Test as Admin:**
   - View all hostels (GET /admin/hostels)
   - Verify the hostel (PUT /admin/verify-hostel/:id)

5. **Test as Student:**
   - View verified hostels (GET /hostels)
   - Search hostels (GET /hostels/search)
   - Create a review (POST /reviews)

---

## Expected Responses

### Success Response (200/201):
```json
{
  "message": "Success message",
  "data": { ... }
}
```

### Error Response (400/401/403/404/500):
```json
{
  "error": "Error message",
  "details": "Additional details (if available)"
}
```

---

## Troubleshooting

### Server won't start
- Check if port 5000 is already in use
- Make sure Node.js is installed: `node --version`
- Install dependencies: `npm install`

### Authentication fails
- Make sure email and password are correct
- Check that user exists in database
- Verify you're using the correct authentication method (headers/query/body)

### Database errors
- Delete `hostel.db` and restart server (will recreate tables)
- Check file permissions

---

## Quick Test Script

Save this as `test-api.sh` (Linux/Mac) or `test-api.ps1` (Windows):

**test-api.sh:**
```bash
#!/bin/bash
BASE_URL="http://localhost:5000"

# Test health
echo "Testing health endpoint..."
curl $BASE_URL
echo -e "\n\n"

# Signup
echo "Creating user..."
curl -X POST $BASE_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","role":"student"}'
echo -e "\n\n"

# Get hostels with headers
echo "Getting hostels..."
curl -X GET $BASE_URL/hostels \
  -H "X-User-Email: test@example.com" \
  -H "X-User-Password: test123"
echo -e "\n"
```

**test-api.ps1:**
```powershell
$baseUrl = "http://localhost:5000"

Write-Host "Testing health endpoint..."
Invoke-RestMethod -Uri $baseUrl

Write-Host "`nCreating user..."
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "test123"
    role = "student"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/auth/signup" -Method POST -Body $body -ContentType "application/json"

Write-Host "`nGetting hostels..."
$headers = @{
    "X-User-Email" = "test@example.com"
    "X-User-Password" = "test123"
}
Invoke-RestMethod -Uri "$baseUrl/hostels" -Method GET -Headers $headers
```


