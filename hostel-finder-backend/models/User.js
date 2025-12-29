const db = require("../config/database");

/**
 * User Model
 * Handles all database operations related to users
 */
class User {
    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise<Object|null>} User object or null
     */
    static async findByEmail(email) {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Find user by ID
     * @param {number} id - User ID
     * @returns {Promise<Object|null>} User object or null
     */
    static async findById(id) {
        const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Create a new user
     * @param {Object} userData - User data (name, email, password, role)
     * @returns {Promise<Object>} Created user object
     */
    static async create(userData) {
        const { name, email, password, role, contact_number } = userData;
        const [result] = await db.query(
            "INSERT INTO users (name, email, password, role, contact_number) VALUES (?, ?, ?, ?, ?)",
            [name, email, password, role, contact_number || null]
        );
        return { id: result.insertId, name, email, role, contact_number };
    }

    /**
     * Update user by ID
     * @param {number} id - User ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated user object
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
            `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
            values
        );
        return await this.findById(id);
    }

    /**
     * Delete user by ID
     * @param {number} id - User ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteById(id) {
        const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }

    /**
     * Get all users
     * @param {Object} filters - Optional filters (role, etc.)
     * @returns {Promise<Array>} Array of user objects
     */
    static async findAll(filters = {}) {
        let query = "SELECT * FROM users";
        const conditions = [];
        const values = [];

        if (filters.role) {
            conditions.push("role = ?");
            values.push(filters.role);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += " ORDER BY id DESC";
        const [rows] = await db.query(query, values);
        return rows;
    }
}

module.exports = User;






















