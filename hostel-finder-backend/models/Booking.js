const db = require("../config/database");

/**
 * Booking Model
 * Handles all database operations related to bookings
 */
class Booking {
    /**
     * Find booking by ID
     * @param {number} id - Booking ID
     * @returns {Promise<Object|null>} Booking object or null
     */
    static async findById(id) {
        const [rows] = await db.query("SELECT * FROM bookings WHERE id = ?", [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Find all bookings for a hostel
     * @param {number} hostelId - Hostel ID
     * @returns {Promise<Array>} Array of booking objects
     */
    static async findByHostel(hostelId) {
        const [rows] = await db.query(
            "SELECT * FROM bookings WHERE hostel_id = ? ORDER BY id DESC",
            [hostelId]
        );
        return rows;
    }

    /**
     * Find all bookings by a student
     * @param {number} studentId - Student ID
     * @returns {Promise<Array>} Array of booking objects
     */
    static async findByStudent(studentId) {
        const [rows] = await db.query(
            "SELECT * FROM bookings WHERE student_id = ? ORDER BY id DESC",
            [studentId]
        );
        return rows;
    }

    /**
     * Create a new booking
     * @param {Object} bookingData - Booking data (hostel_id, student_id, status)
     * @returns {Promise<Object>} Created booking object
     */
    static async create(bookingData) {
        const { hostel_id, student_id, status } = bookingData;
        const [result] = await db.query(
            "INSERT INTO bookings (hostel_id, student_id, status) VALUES (?, ?, ?)",
            [hostel_id, student_id, status || 'pending']
        );
        return { id: result.insertId, hostel_id, student_id, status: status || 'pending' };
    }

    /**
     * Update booking by ID
     * @param {number} id - Booking ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated booking object
     */
    static async updateById(id, updates) {
        const fields = [];
        const values = [];
        
        Object.keys(updates).forEach(key => {
            fields.push(`${key} = ?`);
            values.push(updates[key]);
        });
        
        values.push(id);
        await db.query(
            `UPDATE bookings SET ${fields.join(", ")} WHERE id = ?`,
            values
        );
        return await this.findById(id);
    }

    /**
     * Delete booking by ID
     * @param {number} id - Booking ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteById(id) {
        const [result] = await db.query("DELETE FROM bookings WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Booking;





















