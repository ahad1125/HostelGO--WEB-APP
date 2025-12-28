const User = require("../models/User");

/**
 * AUTHENTICATION MIDDLEWARE
 * Validates user credentials and attaches user info to request
 * Used to protect routes that require authentication
 */

/**
 * Middleware to authenticate user
 * Accepts email and password from:
 * 1. Headers (X-User-Email, X-User-Password) - recommended
 * 2. Query parameters (email, password) - for GET requests
 * 3. Request body (email, password) - for POST/PUT requests
 * Attaches user info to req.user if authentication succeeds
 */
const authenticate = async (req, res, next) => {
    // Try to get credentials from headers first (most RESTful)
    let email = req.headers['x-user-email'] || req.headers['X-User-Email'];
    let password = req.headers['x-user-password'] || req.headers['X-User-Password'];
    
    // Fall back to query parameters (useful for GET requests)
    if (!email || !password) {
        email = email || req.query.email;
        password = password || req.query.password;
    }
    
    // Fall back to request body (for POST/PUT requests)
    if (!email || !password) {
        email = email || req.body.email;
        password = password || req.body.password;
    }

    if (!email || !password) {
        return res.status(401).json({ 
            error: "Authentication required",
            details: "Email and password required for authentication",
            hint: "Provide credentials via headers (X-User-Email, X-User-Password), query params, or request body"
        });
    }

    try {
        // Find user by email
        const user = await User.findByEmail(email);

        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Attach user info to request object (without password)
        // Ensure all required fields are present
        if (!user.id || !user.email || !user.role) {
            console.error("❌ User data incomplete:", user);
            return res.status(500).json({ error: "Invalid user data" });
        }
        
        req.user = {
            id: user.id,
            name: user.name || '',
            email: user.email,
            role: user.role
        };
        next();
    } catch (err) {
        console.error("❌ Authentication error:", err.message);
        return res.status(500).json({ 
            error: "Authentication failed", 
            details: err.message 
        });
    }
};

/**
 * Middleware to check if user has a specific role
 * Usage: requireRole('admin') or requireRole('owner')
 * Must be used after authenticate middleware
 */
const requireRole = (allowedRoles) => {
    // Allow single role string or array of roles
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `Access denied. Required role: ${roles.join(' or ')}` 
            });
        }

        next();
    };
};

module.exports = {
    authenticate,
    requireRole
};
