// Review-Rating.js
const express = require('express');
const router = express.Router();

let db;

function setDb(database) {
    db = database;
}

// Get reviews for a specific book with user details
router.get('/reviews-find/:bookId', async (req, res) => {
    const { bookId } = req.params;
    
    try {
        const [reviews] = await db.query(
            // NOTE: r.GifUrl is already included in the SELECT query
            `SELECT r.Review_id, r.Content, r.Score, r.GifUrl, 
                  u.Username, u.ProfileUrl, a.Account_id
               FROM Reviews r
               LEFT JOIN Accounts a ON r.Account_id = a.Account_id
               LEFT JOIN Users u ON a.Account_id = u.Account_id
               WHERE r.Book_id = ?
               ORDER BY r.Review_id DESC`,
            [bookId]
        );

        res.json({
            success: true,
            data: reviews
        });

    } catch (err) {
        console.error('Get reviews error:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch reviews' 
        });
    }
});

// Add new review and rating
router.post('/reviews-add', async (req, res) => {
    // ⭐ CHANGE 1: Include gifUrl from the request body
    const { bookId, score, content, gifUrl } = req.body;
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            error: 'Not authenticated. Please login first.' 
        });
    }

    const accountId = token;

    // Validate input (gifUrl is optional)
    if (!bookId || !score || !content) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: bookId, score, and content' 
        });
    }

    // Validate score range
    if (score < 1 || score > 5) {
        return res.status(400).json({ 
            success: false, 
            error: 'Score must be between 1 and 5' 
        });
    }
    
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Verify the account exists and is active (logic unchanged)
        const [accountCheck] = await conn.query(
            'SELECT Account_id, Status_A FROM Accounts WHERE Account_id = ?',
            [accountId]
        );

        if (accountCheck.length === 0) {
            await conn.rollback();
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid authentication token' 
            });
        }

        if (accountCheck[0].Status_A === 'Suspended') {
            await conn.rollback();
            return res.status(403).json({ 
                success: false, 
                error: 'Account is suspended' 
            });
        }

        // Check if book exists (logic unchanged)
        const [bookCheck] = await conn.query(
            'SELECT Book_id FROM Books WHERE Book_id = ?',
            [bookId]
        );

        if (bookCheck.length === 0) {
            await conn.rollback();
            return res.status(404).json({ 
                success: false, 
                error: 'Book not found' 
            });
        }

        // Check if user already reviewed this book (logic unchanged)
        const [existingReview] = await conn.query(
            'SELECT Review_id FROM Reviews WHERE Book_id = ? AND Account_id = ?',
            [bookId, accountId]
        );

        if (existingReview.length > 0) {
            await conn.rollback();
            return res.status(400).json({ 
                success: false, 
                error: 'You have already reviewed this book' 
            });
        }

        // Generate new Review_id (logic unchanged)
        const [maxReview] = await conn.query(
            "SELECT MAX(CAST(SUBSTRING(Review_id, 2) AS UNSIGNED)) AS maxNum FROM Reviews"
        );
        const nextReviewNum = (maxReview[0].maxNum || 0) + 1;
        const newReviewId = 'R' + String(nextReviewNum).padStart(3, '0');

        // ⭐ CHANGE 2: Insert review WITH GifUrl
        await conn.query(
            'INSERT INTO Reviews (Review_id, Account_id, Book_id, Content, Score, GifUrl) VALUES (?, ?, ?, ?, ?, ?)',
            [newReviewId, accountId, bookId, content, score, gifUrl] // Use scoreToStore (2-10) and gifUrl
        );

        await conn.commit();

        res.json({
            success: true,
            message: 'Review submitted successfully',
            reviewId: newReviewId
        });

    } catch (err) {
        await conn.rollback();
        console.error('Add review error:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to add review. Please try again.' 
        });
    } finally {
        conn.release();
    }
});

module.exports = { router, setDb };