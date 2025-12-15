const db = require("../database");

/**
 * AUTHENTICATION CONTROLLER
 * Handles user signup and login
 * Note: For prototype purposes, passwords are stored in plain text
 * In production, always use password hashing (bcrypt, etc.)
 */

/**
 * Signup - Create a new user account
 * POST /auth/signup
 * Body: { name, email, password, role }
 */
const signup = (req, res) => {
    const { name, email, password, role } = req.body;

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

    // Check if email already exists
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        if (row) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Insert new user (password stored as plain text for prototype)
        db.run(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, password, role],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: "Failed to create user", details: err.message });
                }

                // Return success with user ID
                res.status(201).json({
                    message: "User created successfully",
                    user: {
                        id: this.lastID,
                        name,
                        email,
                        role
                    }
                });
            }
        );
    });
};

/**
 * Login - Authenticate user and return user info
 * POST /auth/login
 * Body: { email, password }
 * Note: No JWT/sessions - just returns user info if credentials match
 */
const login = (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email and password (plain text comparison for prototype)
    db.get(
        "SELECT id, name, email, role FROM users WHERE email = ? AND password = ?",
        [email, password],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: "Database error", details: err.message });
            }

            if (!row) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            // Return user info (without password)
            res.json({
                message: "Login successful",
                user: row
            });
        }
    );
};

module.exports = {
    signup,
    login
};



