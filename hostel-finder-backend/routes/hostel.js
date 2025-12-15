const express = require("express");
const router = express.Router();
const hostelController = require("../controllers/hostelController");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

/**
 * HOSTEL ROUTES
 * All routes require authentication
 * Different access based on user role
 */

// GET /hostels - Get all hostels (role-based filtering)
// Students: only verified, Owners: only their own, Admins: all
router.get("/", authenticate, hostelController.getAllHostels);

// GET /hostels/search - Search and filter hostels
// Query params: city, maxRent, facility
router.get("/search", authenticate, hostelController.searchHostels);

// GET /hostels/:id - Get single hostel by ID
router.get("/:id", authenticate, hostelController.getHostelById);

// POST /hostels - Create new hostel (owners only)
router.post("/", authenticate, requireRole("owner"), hostelController.createHostel);

// PUT /hostels/:id - Update hostel (owners only, their own hostels)
router.put("/:id", authenticate, requireRole("owner"), hostelController.updateHostel);

// DELETE /hostels/:id - Delete hostel (owners only, their own hostels)
router.delete("/:id", authenticate, requireRole("owner"), hostelController.deleteHostel);

module.exports = router;



