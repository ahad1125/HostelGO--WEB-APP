const express = require("express");
const cors = require("cors");

// Import route modules
const authRoutes = require("./routes/auth");
const hostelRoutes = require("./routes/hostel");
const adminRoutes = require("./routes/admin");
const reviewRoutes = require("./routes/review");
const enquiryRoutes = require("./routes/enquiry");
const bookingRoutes = require("./routes/booking");

const app = express();

// =====================
// Middleware
// =====================
// CORS configuration for production (Vercel) and development
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // In development, allow all origins
        if (process.env.NODE_ENV !== "production") {
            return callback(null, true);
        }
        
        // In production, allow Vercel domains and custom frontend URL
        const allowedPatterns = [
            /^https:\/\/.*\.vercel\.app$/,
            process.env.FRONTEND_URL,
        ].filter(Boolean);
        
        const isAllowed = allowedPatterns.some(pattern => {
            if (pattern instanceof RegExp) {
                return pattern.test(origin);
            }
            return origin === pattern;
        });
        
        if (isAllowed || !origin) {
            callback(null, true);
        } else {
            // For now, allow all in production too (can restrict later)
            callback(null, true);
        }
    },
    credentials: true,
}));
app.use(express.json());

// =====================
// Health / Root Route
// =====================
app.get("/", (req, res) => {
    res.json({
        message: "Hostel Finder Backend API",
        status: "Running",
               endpoints: {
                   auth: "/auth/signup, /auth/login",
                   hostels: "/hostels, /hostels/search, /hostels/:id",
                   admin: "/admin/hostels, /admin/verify-hostel/:id, /admin/unverify-hostel/:id",
                   reviews: "/reviews, /reviews/hostel/:hostelId",
                   enquiries: "/enquiries, /enquiries/hostel/:id",
                   bookings: "/bookings, /bookings/student, /bookings/hostel/:hostelId",
               },
    });
});

// =====================
// Debug Route - Database Status
// =====================
app.get("/debug/db-status", async (req, res) => {
    const db = require("./config/database");
    try {
        // Test connection
        const [result] = await db.query("SELECT 1 as test");
        
        // Check tables
        const [tables] = await db.query("SHOW TABLES");
        const tableNames = tables.map(t => Object.values(t)[0]);
        
        // Count records
        const [userCount] = await db.query("SELECT COUNT(*) as count FROM users");
        const [hostelCount] = await db.query("SELECT COUNT(*) as count FROM hostels");
        
        // Test the actual query that students use
        let studentQueryTest = null;
        try {
            const [studentHostels] = await db.query("SELECT * FROM hostels WHERE is_verified = 1 ORDER BY id DESC");
            studentQueryTest = {
                success: true,
                count: studentHostels.length,
                query: "SELECT * FROM hostels WHERE is_verified = 1 ORDER BY id DESC"
            };
        } catch (queryErr) {
            studentQueryTest = {
                success: false,
                error: queryErr.message,
                code: queryErr.code,
                sqlState: queryErr.sqlState
            };
        }
        
        res.json({
            status: "connected",
            connectionTest: result[0],
            tables: tableNames,
            counts: {
                users: userCount[0].count,
                hostels: hostelCount[0].count
            },
            studentQueryTest: studentQueryTest,
            config: {
                host: process.env.DB_HOST || process.env.MYSQLHOST || "not set",
                user: process.env.DB_USER || process.env.MYSQLUSER || "not set",
                database: process.env.DB_NAME || process.env.MYSQLDATABASE || "not set",
                port: process.env.DB_PORT || process.env.MYSQLPORT || "not set",
                hasPassword: !!(process.env.DB_PASSWORD || process.env.MYSQLPASSWORD)
            }
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            error: err.message,
            code: err.code,
            sqlState: err.sqlState,
            config: {
                host: process.env.DB_HOST || process.env.MYSQLHOST || "not set",
                user: process.env.DB_USER || process.env.MYSQLUSER || "not set",
                database: process.env.DB_NAME || process.env.MYSQLDATABASE || "not set",
                port: process.env.DB_PORT || process.env.MYSQLPORT || "not set",
                hasPassword: !!(process.env.DB_PASSWORD || process.env.MYSQLPASSWORD)
            }
        });
    }
});

// =====================
// Routes
// =====================
app.use("/auth", authRoutes);
app.use("/hostels", hostelRoutes);
app.use("/admin", adminRoutes);
app.use("/reviews", reviewRoutes);
app.use("/enquiries", enquiryRoutes);
app.use("/bookings", bookingRoutes);

// =====================
// 404 Handler
// =====================
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// =====================
// Error Handler
// =====================
app.use((err, req, res, next) => {
    console.error("❌ Unhandled error:", err);
    console.error("Error stack:", err.stack);
    console.error("Request URL:", req.url);
    console.error("Request method:", req.method);
    
    // If response was already sent, don't try to send again
    if (res.headersSent) {
        return next(err);
    }
    
    // Provide more helpful error messages
    const statusCode = err.statusCode || err.status || 500;
    const errorMessage = err.message || "Something went wrong";
    
    res.status(statusCode).json({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// =====================
// Start Server (Railway-safe)
// Wait for database to be ready before starting
// =====================
const PORT = process.env.PORT || 5000;

// Import database and wait for initialization
const db = require("./config/database");

// Wait for database to be ready before starting server
db.ready
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Failed to start server - database not ready");
        process.exit(1);
    });
