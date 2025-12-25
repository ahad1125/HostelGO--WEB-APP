const db = require("../config/database"); // Use direct database queries for reliability

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
const getAllHostels = async (req, res) => {
    try {
        console.log("🔍 Admin: Fetching all hostels");
        
        // Direct query - reliable and fast
        const [rows] = await db.query(
            `SELECT h.*, u.name as owner_name, u.email as owner_email,
                    COALESCE(u.contact_number, '') as owner_contact_number
             FROM hostels h
             JOIN users u ON h.owner_id = u.id
             ORDER BY h.id DESC`
        );
        
        console.log("✅ Admin: Found", rows.length, "hostels");
        res.json(Array.isArray(rows) ? rows : []);
    } catch (err) {
        console.error("❌ Error in admin getAllHostels:", err.message);
        console.error("Error code:", err.code);
        console.error("Error SQL state:", err.sqlState);
        return res.status(500).json({ 
            error: "Database error", 
            details: err.message,
            code: err.code,
            sqlState: err.sqlState
        });
    }
};

/**
 * Verify a hostel
 * PUT /admin/verify-hostel/:id
 * Sets is_verified = 1, making it visible to students
 */
const verifyHostel = async (req, res) => {
    const hostelId = req.params.id;

    try {
        console.log("🔍 Admin: Verifying hostel:", hostelId);
        
        // Check if hostel exists using direct query
        const [hostelRows] = await db.query(
            `SELECT h.*, u.name as owner_name, u.email as owner_email,
                    COALESCE(u.contact_number, '') as owner_contact_number
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

        if (hostel.is_verified === 1) {
            console.log("⚠️ Hostel already verified");
            return res.status(400).json({ error: "Hostel is already verified" });
        }

        // Update verification status using direct query
        await db.query(
            "UPDATE hostels SET is_verified = 1 WHERE id = ?",
            [parseInt(hostelId)]
        );

        // Fetch updated hostel
        const [updatedRows] = await db.query(
            `SELECT h.*, u.name as owner_name, u.email as owner_email,
                    COALESCE(u.contact_number, '') as owner_contact_number
             FROM hostels h
             JOIN users u ON h.owner_id = u.id
             WHERE h.id = ?`,
            [parseInt(hostelId)]
        );

        console.log("✅ Hostel verified successfully");
        res.json({
            message: "Hostel verified successfully",
            hostel: updatedRows[0]
        });
    } catch (err) {
        console.error("❌ Error in verifyHostel:", err.message);
        console.error("Error code:", err.code);
        console.error("Error SQL state:", err.sqlState);
        return res.status(500).json({ 
            error: "Failed to verify hostel", 
            details: err.message,
            code: err.code,
            sqlState: err.sqlState
        });
    }
};

/**
 * Unverify/Reject a hostel
 * PUT /admin/unverify-hostel/:id
 * Deletes the hostel when rejected (removes it from verification dashboard)
 * For verified hostels, this will unverify them instead of deleting
 */
const unverifyHostel = async (req, res) => {
    const hostelId = req.params.id;

    try {
        console.log("🔍 Admin: Unverifying/rejecting hostel:", hostelId);
        
        // Check if hostel exists using direct query
        const [hostelRows] = await db.query(
            `SELECT h.*, u.name as owner_name, u.email as owner_email,
                    COALESCE(u.contact_number, '') as owner_contact_number
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

        // If hostel is pending (is_verified = 0), delete it completely
        // If hostel is verified (is_verified = 1), just unverify it
        if (hostel.is_verified === 0) {
            // Delete the hostel (cascade will handle related records)
            await db.query("DELETE FROM hostels WHERE id = ?", [parseInt(hostelId)]);
            console.log("✅ Hostel deleted (rejected)");
            res.json({
                message: "Hostel rejected and removed successfully",
                deleted: true
            });
        } else {
            // Just unverify verified hostels
            await db.query(
                "UPDATE hostels SET is_verified = 0 WHERE id = ?",
                [parseInt(hostelId)]
            );
            
            // Fetch updated hostel
            const [updatedRows] = await db.query(
                `SELECT h.*, u.name as owner_name, u.email as owner_email,
                        COALESCE(u.contact_number, '') as owner_contact_number
                 FROM hostels h
                 JOIN users u ON h.owner_id = u.id
                 WHERE h.id = ?`,
                [parseInt(hostelId)]
            );

            console.log("✅ Hostel unverified successfully");
            res.json({
                message: "Hostel unverified successfully",
                hostel: updatedRows[0],
                deleted: false
            });
        }
    } catch (err) {
        console.error("❌ Error in unverifyHostel:", err.message);
        console.error("Error code:", err.code);
        console.error("Error SQL state:", err.sqlState);
        return res.status(500).json({ 
            error: "Failed to reject hostel", 
            details: err.message,
            code: err.code,
            sqlState: err.sqlState
        });
    }
};

module.exports = {
    getAllHostels,
    verifyHostel,
    unverifyHostel
};
