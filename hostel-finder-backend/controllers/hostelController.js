const Hostel = require("../models/hostel");
const db = require("../config/database"); // Import db directly for student query

/**
 * HOSTEL CONTROLLER
 * Handles all hostel-related operations
 * Different behaviors based on user role:
 * - Students: Can only view verified hostels
 * - Owners: Can CRUD their own hostels
 * - Admins: Can view all hostels
 */

/**
 * Get public verified hostels (no authentication required)
 * GET /hostels/public
 * Returns only verified hostels for landing page, carousel, etc.
 */
const getPublicHostels = async (req, res) => {
    const db = require("../config/database");
    try {
        console.log("🔍 Getting public hostels (verified only)");
        
        // Direct query - simple and reliable
        const query = "SELECT * FROM hostels WHERE is_verified = 1 ORDER BY id DESC";
        console.log("📝 Executing query:", query);
        
        const [rows] = await db.query(query);
        
        console.log("✅ Found", Array.isArray(rows) ? rows.length : 0, "public hostels");
        
        // Always return an array, even if empty
        const result = Array.isArray(rows) ? rows : [];
        return res.json(result);
    } catch (err) {
        console.error("❌ Error in getPublicHostels:", err.message);
        console.error("Error code:", err.code);
        console.error("Error SQL state:", err.sqlState);
        console.error("Stack:", err.stack);
        
        // Return empty array instead of 500 error
        // This prevents frontend from breaking
        console.log("⚠️ Returning empty array due to error");
        return res.json([]);
    }
};

/**
 * Get all hostels (with role-based filtering)
 * GET /hostels
 * - Students: Only verified hostels
 * - Owners: Only their own hostels
 * - Admins: All hostels
 */
const getAllHostels = async (req, res) => {
    const user = req.user; // Set by authenticate middleware

    // Safety check
    if (!user) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        console.log("🔍 Getting hostels for user:", user.role, user.id);

        // For students, use direct query (same as public endpoint) for reliability
        if (user.role === 'student') {
            console.log("📚 Student: Fetching verified hostels only");
            const [rows] = await db.query(
                `SELECT h.*, u.name as owner_name, u.email as owner_email,
                        COALESCE(u.contact_number, '') as owner_contact_number
                 FROM hostels h
                 JOIN users u ON h.owner_id = u.id
                 WHERE h.is_verified = 1
                 ORDER BY h.id DESC`
            );
            console.log("✅ Found", rows.length, "verified hostels for student");
            return res.json(Array.isArray(rows) ? rows : []);
        }

        // For owners and admins, use the model method
        const filters = {};

        if (user.role === 'owner') {
            // Owners can only see their own hostels
            filters.owner_id = user.id;
            console.log("🏠 Owner: Fetching own hostels");
        } else if (user.role === 'admin') {
            // Admins see all hostels (no filters)
            console.log("👑 Admin: Fetching all hostels");
        }

        console.log("📝 Using filters:", filters);
        
        // For owners and admins, use direct query instead of model method
        let query = `SELECT h.*, u.name as owner_name, u.email as owner_email,
                            COALESCE(u.contact_number, '') as owner_contact_number
                     FROM hostels h
                     JOIN users u ON h.owner_id = u.id`;
        const conditions = [];
        const values = [];

        if (filters.owner_id) {
            conditions.push("h.owner_id = ?");
            values.push(filters.owner_id);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += " ORDER BY h.id DESC";
        
        const [rows] = await db.query(query, values);
        const hostels = Array.isArray(rows) ? rows : [];
        console.log("✅ Found", hostels.length, "hostels");
        
        // Return empty array if no hostels (this is valid, not an error)
        return res.json(hostels);
    } catch (err) {
        console.error("❌ Error in getAllHostels:", err.message);
        console.error("Error code:", err.code);
        console.error("Error SQL state:", err.sqlState);
        console.error("Full error:", err);
        console.error("User object:", user);
        console.error("Stack trace:", err.stack);
        return res.status(500).json({
            error: "Database error",
            details: err.message,
            code: err.code,
            sqlState: err.sqlState,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

/**
 * Search and filter hostels
 * GET /hostels/search?city=Lahore&maxRent=15000&facility=Wifi
 * - Students: Only verified hostels are searchable
 * - Owners: Can search their own hostels
 * - Admins: Can search all hostels
 * 
 * Query parameters:
 * - city: Filter by city name
 * - maxRent: Maximum rent amount
 * - facility: Partial match on facilities string
 */
const searchHostels = async (req, res) => {
    const user = req.user;
    const { city, maxRent, facility, name } = req.query;

    // Safety check
    if (!user || !user.id || !user.role) {
        console.error("❌ User not properly authenticated");
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        console.log("🔍 Searching hostels for user:", user.role, "filters:", { city, maxRent, facility, name });
        
        // Build query with direct database access
        let query = `SELECT h.*, u.name as owner_name, u.email as owner_email,
                            COALESCE(u.contact_number, '') as owner_contact_number
                     FROM hostels h
                     JOIN users u ON h.owner_id = u.id`;
        const conditions = [];
        const values = [];

        // Role-based base filtering
        if (user.role === 'student') {
            conditions.push("h.is_verified = 1");
        } else if (user.role === 'owner') {
            conditions.push("h.owner_id = ?");
            values.push(user.id);
        }
        // Admins see all (no base filter)

        // Add search filters
        if (city) {
            conditions.push("h.city LIKE ?");
            values.push(`%${city}%`);
        }

        if (maxRent) {
            conditions.push("h.rent <= ?");
            values.push(parseInt(maxRent));
        }

        if (facility) {
            conditions.push("LOWER(h.facilities) LIKE ?");
            values.push(`%${facility.toLowerCase()}%`);
        }

        if (name) {
            conditions.push("LOWER(h.name) LIKE ?");
            values.push(`%${name.toLowerCase()}%`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += " ORDER BY h.id DESC";
        
        console.log("📝 Executing search query:", query);
        console.log("With values:", values);
        
        const [rows] = await db.query(query, values);
        const hostels = Array.isArray(rows) ? rows : [];
        
        console.log("✅ Found", hostels.length, "hostels");
        res.json(hostels);
    } catch (err) {
        console.error("❌ Error in searchHostels:", err.message);
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
 * Get single hostel by ID
 * GET /hostels/:id
 * - Students: Can only view if verified
 * - Owners: Can view if it's their own
 * - Admins: Can view any hostel
 */
const getHostelById = async (req, res) => {
    const user = req.user;
    const hostelId = req.params.id;

    try {
        // Safety check - user should always be set by authenticate middleware
        if (!user || !user.id || !user.role) {
            console.error("❌ User not properly authenticated");
            return res.status(401).json({ error: "Authentication required" });
        }
        
        console.log("🔍 Getting hostel by ID:", hostelId, "for user:", user.role, user.id);
        
        // Use direct query for reliability (same pattern as other working endpoints)
        const [rows] = await db.query(
            `SELECT h.*, u.name as owner_name, u.email as owner_email,
                    COALESCE(u.contact_number, '') as owner_contact_number
             FROM hostels h
             JOIN users u ON h.owner_id = u.id
             WHERE h.id = ?`,
            [parseInt(hostelId)]
        );

        if (!rows || rows.length === 0) {
            console.log("❌ Hostel not found:", hostelId);
            return res.status(404).json({ error: "Hostel not found" });
        }

        const hostel = rows[0];
        console.log("✅ Found hostel:", hostel.name, "is_verified:", hostel.is_verified);

        // Role-based access control
        if (user.role === 'student' && hostel.is_verified !== 1) {
            console.log("🚫 Student cannot view unverified hostel");
            return res.status(403).json({ error: "This hostel is not verified yet" });
        }

        if (user.role === 'owner' && hostel.owner_id !== user.id) {
            console.log("🚫 Owner cannot view other's hostel");
            return res.status(403).json({ error: "You can only view your own hostels" });
        }

        // Get booking count (confirmed bookings only)
        const [bookingCountRows] = await db.query(
            "SELECT COUNT(*) as confirmed_bookings FROM bookings WHERE hostel_id = ? AND status = 'confirmed'",
            [parseInt(hostelId)]
        );
        const confirmedBookings = bookingCountRows[0]?.confirmed_bookings || 0;
        hostel.confirmed_bookings = confirmedBookings;

        console.log("✅ Returning hostel data with booking count:", confirmedBookings);
        res.json(hostel);
    } catch (err) {
        console.error("❌ Error in getHostelById:", err.message);
        console.error("Error code:", err.code);
        console.error("Error SQL state:", err.sqlState);
        console.error("Hostel ID was:", hostelId);
        console.error("Stack:", err.stack);
        return res.status(500).json({ 
            error: "Database error", 
            details: err.message,
            code: err.code,
            sqlState: err.sqlState
        });
    }
};

/**
 * Create new hostel listing
 * POST /hostels
 * Only owners can create hostels
 * Body: { name, address, city, rent, facilities }
 */
const createHostel = async (req, res) => {
    const user = req.user;
    const { name, address, city, rent, facilities, image_url } = req.body;

    // Validate required fields
    if (!name || !address || !city || !rent) {
        return res.status(400).json({
            error: "Name, address, city, and rent are required"
        });
    }

    // Validate rent is a number
    if (isNaN(rent) || rent <= 0) {
        return res.status(400).json({ error: "Rent must be a positive number" });
    }

    // Validate image_url length if provided (base64 can be very large)
    // MySQL MEDIUMTEXT can hold up to 16MB, but we'll limit to 2MB base64 (~1.5MB original image) to be safe
    // This allows for reasonable quality images while preventing abuse
    const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
    if (image_url && image_url.length > MAX_IMAGE_SIZE) {
        return res.status(400).json({ 
            error: `Image is too large (${Math.round(image_url.length / 1024)}KB). Maximum allowed is 2MB. Please use a smaller image or upload via URL instead.` 
        });
    }

    try {
        console.log("🔍 Creating hostel by owner:", user.id);
        console.log("📝 Hostel data:", { name, address, city, rent, facilities, image_url_length: image_url ? image_url.length : 0 });
        
        // Process image_url - handle both base64 and URLs
        let processedImageUrl = null;
        if (image_url && image_url.trim() !== '') {
            // If it's a base64 data URL, validate it
            if (image_url.startsWith('data:image/')) {
                processedImageUrl = image_url;
            } else if (image_url.startsWith('http://') || image_url.startsWith('https://')) {
                processedImageUrl = image_url;
            } else {
                // Invalid format, but we'll still try to save it
                processedImageUrl = image_url;
            }
        }
        
        // Use direct query for reliability
        const [result] = await db.query(
            "INSERT INTO hostels (name, address, city, rent, facilities, owner_id, contact_number, is_verified, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [name, address, city, parseInt(rent), facilities || '', user.id, null, 0, processedImageUrl]
        );

        const hostelId = result.insertId;
        
        // Fetch the created hostel with owner info
        const [hostelRows] = await db.query(
            `SELECT h.*, u.name as owner_name, u.email as owner_email,
                    COALESCE(u.contact_number, '') as owner_contact_number
             FROM hostels h
             JOIN users u ON h.owner_id = u.id
             WHERE h.id = ?`,
            [hostelId]
        );

        if (!hostelRows || hostelRows.length === 0) {
            console.error("❌ Hostel was created but could not be retrieved:", hostelId);
            return res.status(500).json({ 
                error: "Hostel was created but could not be retrieved",
                hostel_id: hostelId
            });
        }

        const hostel = hostelRows[0];

        console.log("✅ Hostel created successfully:", hostelId);
        res.status(201).json({
            message: "Hostel created successfully (pending verification)",
            hostel
        });
    } catch (err) {
        console.error("❌ Error in createHostel:", err.message);
        console.error("Error code:", err.code);
        console.error("Error SQL state:", err.sqlState);
        console.error("Stack:", err.stack);
        console.error("Request body keys:", Object.keys(req.body));
        
        // Provide more specific error messages
        let errorMessage = "Failed to create hostel";
        if (err.code === 'ER_DATA_TOO_LONG') {
            errorMessage = "Image data is too large. Please use a smaller image.";
        } else if (err.code === 'ER_BAD_NULL_ERROR') {
            errorMessage = "Required field is missing. Please check all required fields are filled.";
        } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            errorMessage = "Invalid owner reference. Please log in again.";
        }
        
        return res.status(500).json({ 
            error: errorMessage, 
            details: process.env.NODE_ENV === 'development' ? err.message : undefined,
            code: err.code
        });
    }
};

/**
 * Update hostel listing
 * PUT /hostels/:id
 * Only owners can update their own hostels
 * Body: { name, address, city, rent, facilities } (all optional)
 */
const updateHostel = async (req, res) => {
    const user = req.user;
    const hostelId = req.params.id;
    const { name, address, city, rent, facilities, image_url } = req.body;

    try {
        console.log("🔍 Updating hostel:", hostelId, "by owner:", user.id);
        
        // First, check if hostel exists and belongs to user using direct query
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

        if (hostel.owner_id !== user.id) {
            console.log("🚫 Owner cannot update other's hostel");
            return res.status(403).json({ error: "You can only update your own hostels" });
        }

        // Build updates object
        const updates = [];
        const values = [];
        
        if (name !== undefined) {
            updates.push("name = ?");
            values.push(name);
        }
        if (address !== undefined) {
            updates.push("address = ?");
            values.push(address);
        }
        if (city !== undefined) {
            updates.push("city = ?");
            values.push(city);
        }
        if (rent !== undefined) {
            if (isNaN(rent) || rent <= 0) {
                return res.status(400).json({ error: "Rent must be a positive number" });
            }
            updates.push("rent = ?");
            values.push(parseInt(rent));
        }
        if (facilities !== undefined) {
            updates.push("facilities = ?");
            values.push(facilities);
        }
        if (image_url !== undefined) {
            // Handle empty string as null
            updates.push("image_url = ?");
            values.push(image_url && image_url.trim() !== '' ? image_url : null);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        values.push(parseInt(hostelId));
        await db.query(
            `UPDATE hostels SET ${updates.join(", ")} WHERE id = ?`,
            values
        );
        
        console.log("✅ Hostel updated successfully");
        res.json({ message: "Hostel updated successfully" });
    } catch (err) {
        console.error("❌ Error in updateHostel:", err.message);
        console.error("Error code:", err.code);
        console.error("Error SQL state:", err.sqlState);
        return res.status(500).json({ 
            error: "Failed to update hostel", 
            details: err.message,
            code: err.code,
            sqlState: err.sqlState
        });
    }
};

/**
 * Delete hostel listing
 * DELETE /hostels/:id
 * Only owners can delete their own hostels
 */
const deleteHostel = async (req, res) => {
    const user = req.user;
    const hostelId = req.params.id;

    try {
        console.log("🔍 Deleting hostel:", hostelId, "by owner:", user.id);
        
        // First, check if hostel exists and belongs to user using direct query
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

        if (hostel.owner_id !== user.id) {
            console.log("🚫 Owner cannot delete other's hostel");
            return res.status(403).json({ error: "You can only delete your own hostels" });
        }

        // Delete the hostel using direct query
        await db.query("DELETE FROM hostels WHERE id = ?", [parseInt(hostelId)]);

        console.log("✅ Hostel deleted successfully");
        res.json({ message: "Hostel deleted successfully" });
    } catch (err) {
        console.error("❌ Error in deleteHostel:", err.message);
        console.error("Error code:", err.code);
        console.error("Error SQL state:", err.sqlState);
        return res.status(500).json({ 
            error: "Failed to delete hostel", 
            details: err.message,
            code: err.code,
            sqlState: err.sqlState
        });
    }
};

module.exports = {
    getPublicHostels,
    getAllHostels,
    searchHostels,
    getHostelById,
    createHostel,
    updateHostel,
    deleteHostel
};
