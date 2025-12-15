const db = require("../database");

/**
 * ADMIN CONTROLLER
 * Handles admin-only operations
 * Only users with role 'admin' can access these endpoints
 */

/**
 * Get all hostels (verified and unverified)
 * GET /admin/hostels
 * Admin can see all hostels regardless of verification status
 */
const getAllHostels = (req, res) => {
    db.all("SELECT * FROM hostels ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json(rows);
    });
};

/**
 * Verify a hostel
 * PUT /admin/verify-hostel/:id
 * Sets is_verified = 1, making it visible to students
 */
const verifyHostel = (req, res) => {
    const hostelId = req.params.id;

    // Check if hostel exists
    db.get("SELECT * FROM hostels WHERE id = ?", [hostelId], (err, hostel) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        if (!hostel) {
            return res.status(404).json({ error: "Hostel not found" });
        }

        if (hostel.is_verified === 1) {
            return res.status(400).json({ error: "Hostel is already verified" });
        }

        // Update verification status
        db.run(
            "UPDATE hostels SET is_verified = 1 WHERE id = ?",
            [hostelId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: "Failed to verify hostel", details: err.message });
                }

                res.json({ 
                    message: "Hostel verified successfully",
                    hostel: { ...hostel, is_verified: 1 }
                });
            }
        );
    });
};

/**
 * Unverify/Reject a hostel
 * PUT /admin/unverify-hostel/:id
 * Sets is_verified = 0, hiding it from students
 */
const unverifyHostel = (req, res) => {
    const hostelId = req.params.id;

    // Check if hostel exists
    db.get("SELECT * FROM hostels WHERE id = ?", [hostelId], (err, hostel) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        if (!hostel) {
            return res.status(404).json({ error: "Hostel not found" });
        }

        if (hostel.is_verified === 0) {
            return res.status(400).json({ error: "Hostel is already unverified" });
        }

        // Update verification status
        db.run(
            "UPDATE hostels SET is_verified = 0 WHERE id = ?",
            [hostelId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: "Failed to unverify hostel", details: err.message });
                }

                res.json({ 
                    message: "Hostel unverified successfully",
                    hostel: { ...hostel, is_verified: 0 }
                });
            }
        );
    });
};

module.exports = {
    getAllHostels,
    verifyHostel,
    unverifyHostel
};



