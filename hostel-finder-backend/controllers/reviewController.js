const Review = require("../models/Review");
const Hostel = require("../models/Hostel");
const db = require("../config/database"); // Import db directly for reliable queries

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
const createReview = async (req, res) => {
    const user = req.user;
    const { hostel_id, rating, comment } = req.body;

    // Only students can create reviews
    if (user.role !== 'student') {
        return res.status(403).json({ error: "Only students can create reviews" });
    }

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

    try {
        console.log("🔍 Creating review for hostel:", hostel_id, "by student:", user.id);
        
        // Check if hostel exists and is verified using direct query
        const [hostelRows] = await db.query(
            `SELECT h.*, u.name as owner_name
             FROM hostels h
             JOIN users u ON h.owner_id = u.id
             WHERE h.id = ?`,
            [parseInt(hostel_id)]
        );

        if (!hostelRows || hostelRows.length === 0) {
            console.log("❌ Hostel not found:", hostel_id);
            return res.status(404).json({ error: "Hostel not found" });
        }

        const hostel = hostelRows[0];
        console.log("✅ Found hostel:", hostel.name, "is_verified:", hostel.is_verified);

        if (user.role === 'student' && hostel.is_verified !== 1) {
            console.log("🚫 Student cannot review unverified hostel");
            return res.status(403).json({ error: "You can only review verified hostels" });
        }

        // Create new review
        console.log("📝 Creating review with rating:", rating, "comment:", comment?.substring(0, 50));
        const review = await Review.create({
            rating: parseInt(rating),
            comment: comment || '',
            hostel_id: parseInt(hostel_id),
            student_id: user.id
        });

        console.log("✅ Review created successfully:", review.id);
        res.status(201).json({
            message: "Review created successfully",
            review
        });
    } catch (err) {
        console.error("❌ Error in createReview:", err.message);
        console.error("Error code:", err.code);
        console.error("Error SQL state:", err.sqlState);
        console.error("Stack:", err.stack);
        return res.status(500).json({ 
            error: "Failed to create review", 
            details: err.message,
            code: err.code,
            sqlState: err.sqlState
        });
    }
};

/**
 * Get all reviews for a specific hostel
 * GET /reviews/hostel/:hostelId
 * Anyone can view reviews
 */
const getReviewsByHostel = async (req, res) => {
    const hostelId = req.params.hostelId;

    try {
        const reviews = await Review.findByHostel(parseInt(hostelId));
        res.json(reviews);
    } catch (err) {
        return res.status(500).json({ error: "Database error", details: err.message });
    }
};

/**
 * Get all reviews by a specific student
 * GET /reviews/student/:studentId
 */
const getReviewsByStudent = async (req, res) => {
    const studentId = req.params.studentId;

    try {
        const reviews = await Review.findByStudent(parseInt(studentId));
        res.json(reviews);
    } catch (err) {
        return res.status(500).json({ error: "Database error", details: err.message });
    }
};

/**
 * Update a review
 * PUT /reviews/:id
 * Only the student who created the review can update it
 */
const updateReview = async (req, res) => {
    const user = req.user;
    const reviewId = req.params.id;
    const { rating, comment } = req.body;

    // Validate required fields
    if (!rating && !comment) {
        return res.status(400).json({ 
            error: "At least one field (rating or comment) is required" 
        });
    }

    // Validate rating range if provided
    if (rating !== undefined && (isNaN(rating) || rating < 1 || rating > 5)) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    try {
        // Check if review exists and belongs to user
        const review = await Review.findById(parseInt(reviewId));

        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        // Only the student who created the review can update it
        if (review.student_id !== user.id) {
            return res.status(403).json({ error: "You can only update your own reviews" });
        }

        // Build updates object
        const updates = {};
        if (rating !== undefined) updates.rating = rating;
        if (comment !== undefined) updates.comment = comment;

        // Update review
        const updatedReview = await Review.updateById(parseInt(reviewId), updates);

        res.json({
            message: "Review updated successfully",
            review: updatedReview
        });
    } catch (err) {
        return res.status(500).json({ error: "Failed to update review", details: err.message });
    }
};

/**
 * Delete a review
 * DELETE /reviews/:id
 * Only the student who created the review can delete it
 */
const deleteReview = async (req, res) => {
    const user = req.user;
    const reviewId = req.params.id;

    try {
        // Check if review exists and belongs to user
        const review = await Review.findById(parseInt(reviewId));

        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        // Only the student who created the review can delete it
        if (review.student_id !== user.id) {
            return res.status(403).json({ error: "You can only delete your own reviews" });
        }

        // Delete the review
        await Review.deleteById(parseInt(reviewId));

        res.json({ message: "Review deleted successfully" });
    } catch (err) {
        return res.status(500).json({ error: "Failed to delete review", details: err.message });
    }
};

module.exports = {
    createReview,
    getReviewsByHostel,
    getReviewsByStudent,
    updateReview,
    deleteReview
};
