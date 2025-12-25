# How to Find Railway Application Logs

## The Issue
- HTTP Logs show: `GET /hostels` → 500 error
- Deploy Logs are empty
- We need to see the **application console logs** to find the database error

## Steps to Find Application Logs in Railway

### Option 1: Service Logs Tab (Recommended)
1. Go to your **backend service** (not MySQL service)
2. Look for a tab called **"Logs"** or **"Service Logs"** (not "Deploy Logs" or "HTTP Logs")
3. This should show real-time console output from your Node.js application
4. Look for messages starting with:
   - `🔧 Database Config:`
   - `✅` or `❌`
   - `Error`
   - `Database error`

### Option 2: Check All Tabs
Railway might have different log views:
- **"Logs"** - Application console output (what we need)
- **"Deploy Logs"** - Build/deployment logs (empty is normal after deployment)
- **"HTTP Logs"** - HTTP request logs (what you already saw)
- **"Metrics"** - Performance metrics

### Option 3: Use Railway CLI
If you have Railway CLI installed:
```bash
railway logs
```

### Option 4: Check Service Details
1. Click on your backend service
2. Look for a section called **"Logs"** or **"Output"**
3. This should show the running application's console output

## What to Look For

Once you find the console logs, look for:

**Success indicators:**
- `🔧 Database Config: { host: ..., user: ..., database: ... }`
- `✅ Database connection test successful`
- `✅ Database initialized on Railway`
- `📊 Tables created: users, hostels, reviews, bookings, enquiries`
- `✅ Database ready!`
- `🚀 Server running on port 5000`

**Error indicators:**
- `❌ Database connection test failed:`
- `❌ Database initialization failed!`
- `Error code: ER_...`
- `MySQL pool error:`
- Any red error messages

## If You Can't Find Logs

1. **Redeploy the service** - This will generate fresh logs
2. **Check the service is running** - Make sure it's not crashed
3. **Try Railway CLI** - `railway logs` command
4. **Check service status** - Make sure the service shows as "Running"

## Quick Test

After finding the logs, try making a request:
1. Go to your frontend and try to log in again
2. Watch the Railway logs in real-time
3. You should see the error appear immediately

