const db = require("../config/database");

/**
 * Review Model
 * Handles all database operations related to reviews
 */
class Review {
    /**
     * Find review by ID
     * @param {number} id - Review ID
     * @returns {Promise<Object|null>} Review object or null
     */
    static async findById(id) {
        const [rows] = await db.query(
            `SELECT r.*, u.name as student_name
             FROM reviews r
             JOIN users u ON r.student_id = u.id
             WHERE r.id = ?`,
            [id]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Find all reviews for a hostel
     * @param {number} hostelId - Hostel ID
     * @returns {Promise<Array>} Array of review objects
     */
    static async findByHostel(hostelId) {
        const [rows] = await db.query(
            `SELECT r.id, r.rating, r.comment, r.hostel_id, r.student_id, u.name as student_name
             FROM reviews r
             JOIN users u ON r.student_id = u.id
             WHERE r.hostel_id = ?
             ORDER BY r.id DESC`,
            [hostelId]
        );
        return rows;
    }

    /**
     * Find all reviews by a student
     * @param {number} studentId - Student ID
     * @returns {Promise<Array>} Array of review objects
     */
    static async findByStudent(studentId) {
        const [rows] = await db.query(
            `SELECT r.id, r.rating, r.comment, r.hostel_id, r.student_id, h.name as hostel_name
             FROM reviews r
             JOIN hostels h ON r.hostel_id = h.id
             WHERE r.student_id = ?
             ORDER BY r.id DESC`,
            [studentId]
        );
        return rows;
    }

    /**
     * Create a new review
     * @param {Object} reviewData - Review data (rating, comment, hostel_id, student_id)
     * @returns {Promise<Object>} Created review object
     */
    static async create(reviewData) {
        const { rating, comment, hostel_id, student_id } = reviewData;
        const [result] = await db.query(
            "INSERT INTO reviews (rating, comment, hostel_id, student_id) VALUES (?, ?, ?, ?)",
            [parseInt(rating), comment || '', hostel_id, student_id]
        );
        return { id: result.insertId, rating: parseInt(rating), comment: comment || '', hostel_id, student_id };
    }

    /**
     * Update review by ID
     * @param {number} id - Review ID
     * @param {Object} updates - Fields to update (rating, comment)
     * @returns {Promise<Object>} Updated review object
     */
    static async updateById(id, updates) {
        const fields = [];
        const values = [];
        
        if (updates.rating !== undefined) {
            fields.push("rating = ?");
            values.push(parseInt(updates.rating));
        }
        
        if (updates.comment !== undefined) {
            fields.push("comment = ?");
            values.push(updates.comment);
        }
        
        if (fields.length === 0) {
            return await this.findById(id);
        }
        
        values.push(id);
        await db.query(
            `UPDATE reviews SET ${fields.join(", ")} WHERE id = ?`,
            values
        );
        return await this.findById(id);
    }

    /**
     * Delete review by ID
     * @param {number} id - Review ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteById(id) {
        const [result] = await db.query("DELETE FROM reviews WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Review;












