const Booking = require("../models/Booking");
const Hostel = require("../models/Hostel");
const db = require("../config/database"); // Import db directly for reliable queries

/**
 * BOOKING CONTROLLER
 * Handles booking-related operations
 * Only students can create bookings
 */

/**
 * Create a new booking
 * POST /bookings
 * Body: { hostel_id }
 * Only students can create bookings
 */
const createBooking = async (req, res) => {
    const user = req.user;
    const { hostel_id } = req.body;

    // Only students can create bookings
    if (user.role !== 'student') {
        return res.status(403).json({ error: "Only students can book hostels" });
    }

    // Validate required fields
    if (!hostel_id) {
        return res.status(400).json({ 
            error: "hostel_id is required" 
        });
    }

    try {
        console.log("🔍 Creating booking for hostel:", hostel_id, "by student:", user.id);
        
        // Check if hostel exists and is verified using direct query
        const [hostelRows] = await db.query(
            `SELECT h.*, u.name as owner_name
             FROM hostels h
             JOIN users u ON h.owner_id = u.id
             WHERE h.id = ?`,
            [parseInt(hostel_id)]
        );

        if (!hostelRows || hostelRows.length === 0) {
            console.log("❌ Hostel not found:", hostel_id);
            return res.status(404).json({ error: "Hostel not found" });
        }

        const hostel = hostelRows[0];

        // Students can only book verified hostels
        if (hostel.is_verified !== 1) {
            console.log("🚫 Student cannot book unverified hostel");
            return res.status(403).json({ error: "You can only book verified hostels" });
        }

        // Check if student already has a booking for this hostel
        const [existingBookings] = await db.query(
            "SELECT * FROM bookings WHERE hostel_id = ? AND student_id = ? AND status IN ('pending', 'confirmed')",
            [parseInt(hostel_id), user.id]
        );

        if (existingBookings.length > 0) {
            console.log("⚠️ Student already has a booking for this hostel");
            return res.status(400).json({ 
                error: "You already have a booking for this hostel",
                booking: existingBookings[0]
            });
        }

        // Create new booking
        console.log("📝 Creating booking with status: pending");
        const booking = await Booking.create({
            hostel_id: parseInt(hostel_id),
            student_id: user.id,
            status: 'pending'
        });

        console.log("✅ Booking created successfully:", booking.id);
        res.status(201).json({
            message: "Booking created successfully (pending confirmation)",
            booking
        });
    } catch (err) {
        console.error("❌ Error in createBooking:", err.message);
        console.error("Error code:", err.code);
        console.error("Error SQL state:", err.sqlState);
        console.error("Stack:", err.stack);
        return res.status(500).json({ 
            error: "Failed to create booking", 
            details: err.message,
            code: err.code,
            sqlState: err.sqlState
        });
    }
};

/**
 * Get all bookings by student
 * GET /bookings/student
 * Returns all bookings for the logged-in student
 */
const getBookingsByStudent = async (req, res) => {
    const user = req.user;

    try {
        // Only students can access this endpoint
        if (user.role !== 'student') {
            return res.status(403).json({ error: "Only students can view their bookings" });
        }

        console.log("🔍 Getting bookings for student:", user.id);
        
        // Get bookings with hostel details using direct query
        const [rows] = await db.query(
            `SELECT b.*, h.name as hostel_name, h.address as hostel_address, 
                    h.city as hostel_city, h.rent as hostel_rent,
                    u.name as owner_name, u.email as owner_email,
                    COALESCE(u.contact_number, '') as owner_contact_number
             FROM bookings b
             JOIN hostels h ON b.hostel_id = h.id
             JOIN users u ON h.owner_id = u.id
             WHERE b.student_id = ?
             ORDER BY b.id DESC`,
            [user.id]
        );

        console.log("✅ Found", rows.length, "bookings for student");
        res.json(rows);
    } catch (err) {
        console.error("❌ Error in getBookingsByStudent:", err.message);
        return res.status(500).json({ error: "Database error", details: err.message });
    }
};

/**
 * Get all bookings for a hostel (owner view)
 * GET /bookings/hostel/:hostelId
 * Only owners can view bookings for their own hostels
 */
const getBookingsByHostel = async (req, res) => {
    const user = req.user;
    const hostelId = req.params.hostelId;

    try {
        console.log("🔍 Getting bookings for hostel:", hostelId, "by owner:", user.id);
        
        // Check if hostel exists and belongs to user using direct query
        const [hostelRows] = await db.query(
            `SELECT h.*, u.name as owner_name
             FROM hostels h
             JOIN users u ON h.owner_id = u.id
             WHERE h.id = ?`,
            [parseInt(hostelId)]
        );

        if (!hostelRows || hostelRows.length === 0) {
            console.log("❌ Hostel not found:", hostelId);
            return res.status(404).json({ error: "Hostel not found" });
        }

        const hostel = hostelRows[0];

        // Only owners can view bookings for their hostels
        if (user.role !== 'owner' || hostel.owner_id !== user.id) {
            console.log("🚫 User cannot view bookings for this hostel");
            return res.status(403).json({ error: "You can only view bookings for your own hostels" });
        }

        // Get bookings with student details
        const [rows] = await db.query(
            `SELECT b.*, u.name as student_name, u.email as student_email,
                    COALESCE(u.contact_number, '') as student_contact_number
             FROM bookings b
             JOIN users u ON b.student_id = u.id
             WHERE b.hostel_id = ?
             ORDER BY b.id DESC`,
            [parseInt(hostelId)]
        );

        console.log("✅ Found", rows.length, "bookings for hostel");
        res.json(rows);
    } catch (err) {
        console.error("❌ Error in getBookingsByHostel:", err.message);
        return res.status(500).json({ error: "Database error", details: err.message });
    }
};

/**
 * Update booking status
 * PUT /bookings/:id
 * Body: { status } - 'pending', 'confirmed', or 'cancelled'
 * Students can cancel their bookings, owners can confirm/cancel
 */
const updateBooking = async (req, res) => {
    const user = req.user;
    const bookingId = req.params.id;
    const { status } = req.body;

    // Validate status
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ 
            error: "Status must be 'pending', 'confirmed', or 'cancelled'" 
        });
    }

    try {
        console.log("🔍 Updating booking:", bookingId, "status:", status, "by user:", user.role, user.id);
        
        // Get booking with hostel details
        const [bookingRows] = await db.query(
            `SELECT b.*, h.owner_id, h.name as hostel_name
             FROM bookings b
             JOIN hostels h ON b.hostel_id = h.id
             WHERE b.id = ?`,
            [parseInt(bookingId)]
        );

        if (!bookingRows || bookingRows.length === 0) {
            console.log("❌ Booking not found:", bookingId);
            return res.status(404).json({ error: "Booking not found" });
        }

        const booking = bookingRows[0];

        // Permission checks
        if (user.role === 'student') {
            // Students can only update their own bookings
            if (booking.student_id !== user.id) {
                return res.status(403).json({ error: "You can only update your own bookings" });
            }
            // Students can only cancel bookings
            if (status !== 'cancelled') {
                return res.status(403).json({ error: "Students can only cancel bookings" });
            }
        } else if (user.role === 'owner') {
            // Owners can only update bookings for their hostels
            if (booking.owner_id !== user.id) {
                return res.status(403).json({ error: "You can only update bookings for your own hostels" });
            }
            // Owners can confirm or cancel
            if (!['confirmed', 'cancelled'].includes(status)) {
                return res.status(400).json({ error: "Owners can only confirm or cancel bookings" });
            }
        } else {
            return res.status(403).json({ error: "Only students and owners can update bookings" });
        }

        // Update booking status
        await db.query(
            "UPDATE bookings SET status = ? WHERE id = ?",
            [status, parseInt(bookingId)]
        );

        // Fetch updated booking
        const [updatedRows] = await db.query(
            `SELECT b.*, h.name as hostel_name, u.name as student_name
             FROM bookings b
             JOIN hostels h ON b.hostel_id = h.id
             JOIN users u ON b.student_id = u.id
             WHERE b.id = ?`,
            [parseInt(bookingId)]
        );

        console.log("✅ Booking updated successfully");
        res.json({
            message: "Booking updated successfully",
            booking: updatedRows[0]
        });
    } catch (err) {
        console.error("❌ Error in updateBooking:", err.message);
        console.error("Error code:", err.code);
        console.error("Error SQL state:", err.sqlState);
        return res.status(500).json({ 
            error: "Failed to update booking", 
            details: err.message,
            code: err.code,
            sqlState: err.sqlState
        });
    }
};

/**
 * Delete booking
 * DELETE /bookings/:id
 * Only students can delete their own bookings
 */
const deleteBooking = async (req, res) => {
    const user = req.user;
    const bookingId = req.params.id;

    try {
        console.log("🔍 Deleting booking:", bookingId, "by user:", user.role, user.id);
        
        // Get booking to check ownership
        const booking = await Booking.findById(parseInt(bookingId));

        if (!booking) {
            console.log("❌ Booking not found:", bookingId);
            return res.status(404).json({ error: "Booking not found" });
        }

        // Only students can delete their own bookings
        if (user.role !== 'student' || booking.student_id !== user.id) {
            console.log("🚫 User cannot delete this booking");
            return res.status(403).json({ error: "You can only delete your own bookings" });
        }

        // Delete the booking
        await Booking.deleteById(parseInt(bookingId));

        console.log("✅ Booking deleted successfully");
        res.json({ message: "Booking deleted successfully" });
    } catch (err) {
        console.error("❌ Error in deleteBooking:", err.message);
        return res.status(500).json({ error: "Failed to delete booking", details: err.message });
    }
};

module.exports = {
    createBooking,
    getBookingsByStudent,
    getBookingsByHostel,
    updateBooking,
    deleteBooking
};



