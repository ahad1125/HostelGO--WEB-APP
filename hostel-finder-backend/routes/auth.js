const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/**
 * AUTHENTICATION ROUTES
 * Public routes for user signup and login
 */

// POST /auth/signup - Create new user account
router.post("/signup", authController.signup);

// POST /auth/login - Login user
router.post("/login", authController.login);

module.exports = router;



