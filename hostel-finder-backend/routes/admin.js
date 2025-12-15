const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

/**
 * ADMIN ROUTES
 * All routes require admin role
 */

// GET /admin/hostels - Get all hostels (verified and unverified)
router.get("/hostels", authenticate, requireRole("admin"), adminController.getAllHostels);

// PUT /admin/verify-hostel/:id - Verify a hostel (make it visible to students)
router.put("/verify-hostel/:id", authenticate, requireRole("admin"), adminController.verifyHostel);

// PUT /admin/unverify-hostel/:id - Unverify a hostel (hide it from students)
router.put("/unverify-hostel/:id", authenticate, requireRole("admin"), adminController.unverifyHostel);

module.exports = router;



