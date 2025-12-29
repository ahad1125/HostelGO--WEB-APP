const db = require("../config/database");

/**
 * Enquiry Model
 * Handles all database operations related to enquiries
 */
class Enquiry {
    /**
     * Find enquiry by ID
     * @param {number} id - Enquiry ID
     * @returns {Promise<Object|null>} Enquiry object or null
     */
    static async findById(id) {
        const [rows] = await db.query(
            `SELECT e.*, u.name as student_name, u.email as student_email,
                    h.name as hostel_name, h.address as hostel_address, h.city as hostel_city
             FROM enquiries e
             JOIN users u ON e.student_id = u.id
             JOIN hostels h ON e.hostel_id = h.id
             WHERE e.id = ?`,
            [id]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Find all enquiries for a hostel
     * @param {number} hostelId - Hostel ID
     * @returns {Promise<Array>} Array of enquiry objects
     */
    static async findByHostel(hostelId) {
        const [rows] = await db.query(
            `SELECT e.*, u.name as student_name, u.email as student_email
             FROM enquiries e
             JOIN users u ON e.student_id = u.id
             WHERE e.hostel_id = ?
             ORDER BY e.created_at DESC`,
            [hostelId]
        );
        return rows;
    }

    /**
     * Find all enquiries for hostels owned by a specific owner
     * @param {number} ownerId - Owner ID
     * @returns {Promise<Array>} Array of enquiry objects
     */
    static async findByOwner(ownerId) {
        const [rows] = await db.query(
            `SELECT e.*, u.name as student_name, u.email as student_email,
                    h.name as hostel_name, h.address as hostel_address, h.city as hostel_city
             FROM enquiries e
             JOIN users u ON e.student_id = u.id
             JOIN hostels h ON e.hostel_id = h.id
             WHERE h.owner_id = ?
             ORDER BY e.created_at DESC`,
            [ownerId]
        );
        return rows;
    }

    /**
     * Find all enquiries by a student
     * @param {number} studentId - Student ID
     * @returns {Promise<Array>} Array of enquiry objects
     */
    static async findByStudent(studentId) {
        const [rows] = await db.query(
            `SELECT e.*, h.name as hostel_name, h.address as hostel_address, h.city as hostel_city,
                    o.name as owner_name, o.email as owner_email
             FROM enquiries e
             JOIN hostels h ON e.hostel_id = h.id
             JOIN users o ON h.owner_id = o.id
             WHERE e.student_id = ?
             ORDER BY e.created_at DESC`,
            [studentId]
        );
        return rows;
    }

    /**
     * Create a new enquiry
     * @param {Object} enquiryData - Enquiry data
     * @returns {Promise<Object>} Created enquiry object
     */
    static async create(enquiryData) {
        const { hostel_id, student_id, type, message, scheduled_date } = enquiryData;
        const [result] = await db.query(
            "INSERT INTO enquiries (hostel_id, student_id, type, message, scheduled_date, status) VALUES (?, ?, ?, ?, ?, 'pending')",
            [hostel_id, student_id, type, message || null, scheduled_date || null]
        );
        return { id: result.insertId, ...enquiryData, status: 'pending' };
    }

    /**
     * Update enquiry by ID
     * @param {number} id - Enquiry ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated enquiry object
     */
    static async updateById(id, updates) {
        const fields = [];
        const values = [];
        
        Object.keys(updates).forEach(key => {
            fields.push(`${key} = ?`);
            values.push(updates[key]);
        });
        
        if (updates.reply) {
            fields.push("replied_at = CURRENT_TIMESTAMP");
        }
        
        values.push(id);
        await db.query(
            `UPDATE enquiries SET ${fields.join(", ")} WHERE id = ?`,
            values
        );
        return await this.findById(id);
    }

    /**
     * Delete enquiry by ID
     * @param {number} id - Enquiry ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteById(id) {
        const [result] = await db.query("DELETE FROM enquiries WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Enquiry;





















