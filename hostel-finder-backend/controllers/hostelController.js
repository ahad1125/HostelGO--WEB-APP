const db = require("../database");

/**
 * HOSTEL CONTROLLER
 * Handles all hostel-related operations
 * Different behaviors based on user role:
 * - Students: Can only view verified hostels
 * - Owners: Can CRUD their own hostels
 * - Admins: Can view all hostels
 */

/**
 * Get all hostels (with role-based filtering)
 * GET /hostels
 * - Students: Only verified hostels
 * - Owners: Only their own hostels
 * - Admins: All hostels
 */
const getAllHostels = (req, res) => {
    const user = req.user; // Set by authenticate middleware

    let query = "SELECT * FROM hostels";
    let params = [];

    // Role-based filtering
    if (user.role === 'student') {
        // Students can only see verified hostels
        query += " WHERE is_verified = 1";
    } else if (user.role === 'owner') {
        // Owners can only see their own hostels
        query += " WHERE owner_id = ?";
        params.push(user.id);
    }
    // Admins see all hostels (no WHERE clause)

    query += " ORDER BY id DESC";

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json(rows);
    });
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
const searchHostels = (req, res) => {
    const user = req.user;
    const { city, maxRent, facility } = req.query;

    // Start building query with role-based base filter
    let query = "SELECT * FROM hostels";
    let conditions = [];
    let params = [];

    // Role-based base filtering
    if (user.role === 'student') {
        conditions.push("is_verified = 1");
    } else if (user.role === 'owner') {
        conditions.push("owner_id = ?");
        params.push(user.id);
    }

    // Add search filters
    if (city) {
        conditions.push("city = ?");
        params.push(city);
    }

    if (maxRent) {
        conditions.push("rent <= ?");
        params.push(parseInt(maxRent));
    }

    if (facility) {
        // Partial match on facilities (case-insensitive)
        conditions.push("LOWER(facilities) LIKE ?");
        params.push(`%${facility.toLowerCase()}%`);
    }

    // Combine all conditions
    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY id DESC";

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json(rows);
    });
};

/**
 * Get single hostel by ID
 * GET /hostels/:id
 * - Students: Can only view if verified
 * - Owners: Can view if it's their own
 * - Admins: Can view any hostel
 */
const getHostelById = (req, res) => {
    const user = req.user;
    const hostelId = req.params.id;

    // First, get the hostel
    db.get("SELECT * FROM hostels WHERE id = ?", [hostelId], (err, hostel) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        if (!hostel) {
            return res.status(404).json({ error: "Hostel not found" });
        }

        // Role-based access control
        if (user.role === 'student' && hostel.is_verified !== 1) {
            return res.status(403).json({ error: "This hostel is not verified yet" });
        }

        if (user.role === 'owner' && hostel.owner_id !== user.id) {
            return res.status(403).json({ error: "You can only view your own hostels" });
        }

        res.json(hostel);
    });
};

/**
 * Create new hostel listing
 * POST /hostels
 * Only owners can create hostels
 * Body: { name, address, city, rent, facilities }
 */
const createHostel = (req, res) => {
    const user = req.user;
    const { name, address, city, rent, facilities } = req.body;

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

    // Insert new hostel (is_verified defaults to 0)
    db.run(
        "INSERT INTO hostels (name, address, city, rent, facilities, owner_id, is_verified) VALUES (?, ?, ?, ?, ?, ?, 0)",
        [name, address, city, parseInt(rent), facilities || '', user.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: "Failed to create hostel", details: err.message });
            }

            res.status(201).json({
                message: "Hostel created successfully (pending verification)",
                hostel: {
                    id: this.lastID,
                    name,
                    address,
                    city,
                    rent: parseInt(rent),
                    facilities: facilities || '',
                    owner_id: user.id,
                    is_verified: 0
                }
            });
        }
    );
};

/**
 * Update hostel listing
 * PUT /hostels/:id
 * Only owners can update their own hostels
 * Body: { name, address, city, rent, facilities } (all optional)
 */
const updateHostel = (req, res) => {
    const user = req.user;
    const hostelId = req.params.id;
    const { name, address, city, rent, facilities } = req.body;

    // First, check if hostel exists and belongs to user
    db.get("SELECT * FROM hostels WHERE id = ?", [hostelId], (err, hostel) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        if (!hostel) {
            return res.status(404).json({ error: "Hostel not found" });
        }

        if (hostel.owner_id !== user.id) {
            return res.status(403).json({ error: "You can only update your own hostels" });
        }

        // Build update query dynamically based on provided fields
        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push("name = ?");
            params.push(name);
        }
        if (address !== undefined) {
            updates.push("address = ?");
            params.push(address);
        }
        if (city !== undefined) {
            updates.push("city = ?");
            params.push(city);
        }
        if (rent !== undefined) {
            if (isNaN(rent) || rent <= 0) {
                return res.status(400).json({ error: "Rent must be a positive number" });
            }
            updates.push("rent = ?");
            params.push(parseInt(rent));
        }
        if (facilities !== undefined) {
            updates.push("facilities = ?");
            params.push(facilities);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        params.push(hostelId);

        // Execute update
        db.run(
            `UPDATE hostels SET ${updates.join(", ")} WHERE id = ?`,
            params,
            function(err) {
                if (err) {
                    return res.status(500).json({ error: "Failed to update hostel", details: err.message });
                }

                res.json({ message: "Hostel updated successfully" });
            }
        );
    });
};

/**
 * Delete hostel listing
 * DELETE /hostels/:id
 * Only owners can delete their own hostels
 */
const deleteHostel = (req, res) => {
    const user = req.user;
    const hostelId = req.params.id;

    // First, check if hostel exists and belongs to user
    db.get("SELECT * FROM hostels WHERE id = ?", [hostelId], (err, hostel) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        if (!hostel) {
            return res.status(404).json({ error: "Hostel not found" });
        }

        if (hostel.owner_id !== user.id) {
            return res.status(403).json({ error: "You can only delete your own hostels" });
        }

        // Delete the hostel
        db.run("DELETE FROM hostels WHERE id = ?", [hostelId], function(err) {
            if (err) {
                return res.status(500).json({ error: "Failed to delete hostel", details: err.message });
            }

            res.json({ message: "Hostel deleted successfully" });
        });
    });
};

module.exports = {
    getAllHostels,
    searchHostels,
    getHostelById,
    createHostel,
    updateHostel,
    deleteHostel
};



