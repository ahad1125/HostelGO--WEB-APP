const db = require("../database");

/**
 * REVIEW CONTROLLER
 * Handles review-related operations
 * Only students can create reviews
 */

/**
 * Create a new review for a hostel
 * POST /reviews
 * Body: { hostel_id, rating, comment }
 * Only students can create reviews
 */
const createReview = (req, res) => {
    const user = req.user;
    const { hostel_id, rating, comment } = req.body;

    // Validate required fields
    if (!hostel_id || !rating) {
        return res.status(400).json({ 
            error: "hostel_id and rating are required" 
        });
    }

    // Validate rating range (1-5)
    if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if hostel exists and is verified (students can only review verified hostels)
    db.get("SELECT * FROM hostels WHERE id = ?", [hostel_id], (err, hostel) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        if (!hostel) {
            return res.status(404).json({ error: "Hostel not found" });
        }

        if (user.role === 'student' && hostel.is_verified !== 1) {
            return res.status(403).json({ error: "You can only review verified hostels" });
        }

        // Insert new review
        db.run(
            "INSERT INTO reviews (rating, comment, hostel_id, student_id) VALUES (?, ?, ?, ?)",
            [parseInt(rating), comment || '', hostel_id, user.id],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: "Failed to create review", details: err.message });
                }

                res.status(201).json({
                    message: "Review created successfully",
                    review: {
                        id: this.lastID,
                        rating: parseInt(rating),
                        comment: comment || '',
                        hostel_id,
                        student_id: user.id
                    }
                });
            }
        );
    });
};

/**
 * Get all reviews for a specific hostel
 * GET /reviews/hostel/:hostelId
 * Anyone can view reviews
 */
const getReviewsByHostel = (req, res) => {
    const hostelId = req.params.hostelId;

    // Get all reviews for this hostel with student names
    db.all(
        `SELECT r.id, r.rating, r.comment, r.hostel_id, r.student_id, u.name as student_name
         FROM reviews r
         JOIN users u ON r.student_id = u.id
         WHERE r.hostel_id = ?
         ORDER BY r.id DESC`,
        [hostelId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: "Database error", details: err.message });
            }
            res.json(rows);
        }
    );
};

/**
 * Get all reviews by a specific student
 * GET /reviews/student/:studentId
 */
const getReviewsByStudent = (req, res) => {
    const studentId = req.params.studentId;

    db.all(
        `SELECT r.id, r.rating, r.comment, r.hostel_id, r.student_id, h.name as hostel_name
         FROM reviews r
         JOIN hostels h ON r.hostel_id = h.id
         WHERE r.student_id = ?
         ORDER BY r.id DESC`,
        [studentId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: "Database error", details: err.message });
            }
            res.json(rows);
        }
    );
};

module.exports = {
    createReview,
    getReviewsByHostel,
    getReviewsByStudent
};



