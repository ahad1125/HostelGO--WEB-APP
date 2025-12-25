const Hostel = require("../models/hostel");

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
const getAllHostels = async (req, res) => {
    const user = req.user; // Set by authenticate middleware

    // Safety check
    if (!user) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        const filters = {};

        // Role-based filtering
        if (user.role === 'student') {
            // Students can only see verified hostels
            filters.is_verified = 1;
        } else if (user.role === 'owner') {
            // Owners can only see their own hostels
            filters.owner_id = user.id;
        }
        // Admins see all hostels (no filters)

        console.log("Getting hostels with filters:", filters, "for user:", user);
        const hostels = await Hostel.findAll(filters);
        console.log("Found", hostels.length, "hostels");
        
        // Return empty array if no hostels (this is valid, not an error)
        return res.json(hostels || []);
    } catch (err) {
        console.error("Error in getAllHostels:", err.message);
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
    const { city, maxRent, facility } = req.query;

    try {
        // Build filters object
        const filters = {};

        // Role-based base filtering
        if (user.role === 'student') {
            filters.is_verified = 1;
        } else if (user.role === 'owner') {
            filters.owner_id = user.id;
        }

        // Add search filters
        if (city) {
            filters.city = city;
        }

        if (maxRent) {
            filters.maxRent = maxRent;
        }

        if (facility) {
            filters.facility = facility;
        }

        // Use Hostel model to find hostels with filters
        const hostels = await Hostel.findAll(filters);
        res.json(hostels);
    } catch (err) {
        return res.status(500).json({ error: "Database error", details: err.message });
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
        const hostel = await Hostel.findById(parseInt(hostelId));

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
    } catch (err) {
        return res.status(500).json({ error: "Database error", details: err.message });
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

    try {
        const hostel = await Hostel.create({
            name,
            address,
            city,
            rent,
            facilities: facilities || '',
            owner_id: user.id,
            is_verified: 0
        });

        res.status(201).json({
            message: "Hostel created successfully (pending verification)",
            hostel
        });
    } catch (err) {
        return res.status(500).json({ error: "Failed to create hostel", details: err.message });
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
    const { name, address, city, rent, facilities } = req.body;

    try {
        // First, check if hostel exists and belongs to user
        const hostel = await Hostel.findById(parseInt(hostelId));

        if (!hostel) {
            return res.status(404).json({ error: "Hostel not found" });
        }

        if (hostel.owner_id !== user.id) {
            return res.status(403).json({ error: "You can only update your own hostels" });
        }

        // Build updates object
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (address !== undefined) updates.address = address;
        if (city !== undefined) updates.city = city;
        if (rent !== undefined) {
            if (isNaN(rent) || rent <= 0) {
                return res.status(400).json({ error: "Rent must be a positive number" });
            }
            updates.rent = rent;
        }
        if (facilities !== undefined) updates.facilities = facilities;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        await Hostel.updateById(parseInt(hostelId), updates);
        res.json({ message: "Hostel updated successfully" });
    } catch (err) {
        return res.status(500).json({ error: "Failed to update hostel", details: err.message });
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
        // First, check if hostel exists and belongs to user
        const hostel = await Hostel.findById(parseInt(hostelId));

        if (!hostel) {
            return res.status(404).json({ error: "Hostel not found" });
        }

        if (hostel.owner_id !== user.id) {
            return res.status(403).json({ error: "You can only delete your own hostels" });
        }

        // Delete the hostel
        await Hostel.deleteById(parseInt(hostelId));

        res.json({ message: "Hostel deleted successfully" });
    } catch (err) {
        return res.status(500).json({ error: "Failed to delete hostel", details: err.message });
    }
};

module.exports = {
    getAllHostels,
    searchHostels,
    getHostelById,
    createHostel,
    updateHostel,
    deleteHostel
};
