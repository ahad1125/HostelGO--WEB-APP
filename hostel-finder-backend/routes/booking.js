const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

/**
 * BOOKING ROUTES
 * Students can create and manage their bookings
 * Owners can view and confirm bookings for their hostels
 */

// POST /bookings - Create new booking (students only)
router.post("/", authenticate, requireRole("student"), bookingController.createBooking);

// GET /bookings/student - Get all bookings by student (students only)
router.get("/student", authenticate, requireRole("student"), bookingController.getBookingsByStudent);

// GET /bookings/hostel/:hostelId - Get bookings for a hostel (owners only)
router.get("/hostel/:hostelId", authenticate, requireRole("owner"), bookingController.getBookingsByHostel);

// PUT /bookings/:id - Update booking status
router.put("/:id", authenticate, bookingController.updateBooking);

// DELETE /bookings/:id - Delete booking (students only, own bookings)
router.delete("/:id", authenticate, requireRole("student"), bookingController.deleteBooking);

module.exports = router;





















