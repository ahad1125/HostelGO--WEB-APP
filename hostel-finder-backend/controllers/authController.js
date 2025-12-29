const User = require("../models/User");

/**
 * AUTHENTICATION CONTROLLER
 * Handles user signup and login
 * Note: For prototype purposes, passwords are stored in plain text
 * In production, always use password hashing (bcrypt, etc.)
 */

/**
 * Signup - Create a new user account
 * POST /auth/signup
 * Body: { name, email, password, role, contact_number }
 */
const signup = async (req, res) => {
    const { name, email, password, role, contact_number } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
        return res.status(400).json({ 
            error: "All fields (name, email, password, role) are required" 
        });
    }

    // Validate role
    if (!['student', 'owner', 'admin'].includes(role)) {
        return res.status(400).json({ 
            error: "Role must be 'student', 'owner', or 'admin'" 
        });
    }

    try {
        // Check if email already exists
        const existingUser = await User.findByEmail(email);

        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Create new user (password stored as plain text for prototype)
        const user = await User.create({ name, email, password, role, contact_number: contact_number || null });

        // Return success with user ID
        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        return res.status(500).json({ error: "Database error", details: err.message });
    }
};

/**
 * Login - Authenticate user and return user info
 * POST /auth/login
 * Body: { email, password }
 * Note: No JWT/sessions - just returns user info if credentials match
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Find user by email
        const user = await User.findByEmail(email);

        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Return user info (without password)
        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        return res.status(500).json({ error: "Database error", details: err.message });
    }
};

module.exports = {
    signup,
    login
};
