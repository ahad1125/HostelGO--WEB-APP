const express = require("express");
const cors = require("cors");
const db = require("./database");

// Import route modules
const authRoutes = require("./routes/auth");
const hostelRoutes = require("./routes/hostel");
const adminRoutes = require("./routes/admin");
const reviewRoutes = require("./routes/review");

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Root route - Health check
app.get("/", (req, res) => {
    res.json({ 
        message: "Hostel Finder Backend API",
        status: "Running",
        endpoints: {
            auth: "/auth/signup, /auth/login",
            hostels: "/hostels, /hostels/search, /hostels/:id",
            admin: "/admin/hostels, /admin/verify-hostel/:id, /admin/unverify-hostel/:id",
            reviews: "/reviews, /reviews/hostel/:hostelId, /reviews/student/:studentId"
        }
    });
});

// Route handlers
app.use("/auth", authRoutes); // Authentication routes (public)
app.use("/hostels", hostelRoutes); // Hostel routes (authenticated, role-based)
app.use("/admin", adminRoutes); // Admin routes (admin only)
app.use("/reviews", reviewRoutes); // Review routes (students create, anyone view)

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!", details: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
});
