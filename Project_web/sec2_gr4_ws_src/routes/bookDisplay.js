// routes/bookDisplay.js
const express = require('express');
const router = express.Router();

let db;

function setDb(database) {
  db = database;
}

// Get top 10 books by average rating
router.get('/books/top10', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.Book_id,
        b.Title,
        b.CoverUrl,
        b.Type,
        b.Genre,
        COALESCE(AVG(r.Score)) as avg_rating,
        COUNT(r.Review_id) as rating_count
      FROM Books b
      LEFT JOIN Reviews r ON b.Book_id = r.Book_id
      GROUP BY b.Book_id, b.Title, b.CoverUrl, b.Type, b.Genre
      ORDER BY avg_rating DESC, rating_count DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching top 10 books:', error);
    res.status(500).json({ error: 'Failed to fetch top 10 books' });
  }
});

// Get recently added books
router.get('/books/recent', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.Book_id,
        b.Title,
        b.CoverUrl,
        b.Type,
        b.Genre,
        b.Release_year,
        COALESCE(AVG(r.Score)) as avg_rating
      FROM Books b
      LEFT JOIN Reviews r ON b.Book_id = r.Book_id
      GROUP BY b.Book_id, b.Title, b.CoverUrl, b.Type, b.Genre, b.Release_year
      ORDER BY b.Release_year DESC, b.Book_id DESC
      LIMIT 6
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching recent books:', error);
    res.status(500).json({ error: 'Failed to fetch recent books' });
  }
});

// Get books on hiatus
router.get('/books/hiatus', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.Book_id,
        b.Title,
        b.CoverUrl,
        b.Type,
        b.Genre,
        COALESCE(AVG(r.Score)) as avg_rating
      FROM Books b
      LEFT JOIN Reviews r ON b.Book_id = r.Book_id
      WHERE b.Status_B = 'Hiatus'
      GROUP BY b.Book_id, b.Title, b.CoverUrl, b.Type, b.Genre
      LIMIT 6
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching hiatus books:', error);
    res.status(500).json({ error: 'Failed to fetch hiatus books' });
  }
});

// Get top books by type (manga, manhwa, novel)
router.get('/books/top-by-type/:type', async (req, res) => {
  try {
    const type = req.params.type.toLowerCase();
    const [rows] = await db.query(`
      SELECT 
        b.Book_id,
        b.Title,
        b.CoverUrl,
        b.Type,
        b.Genre,
        COALESCE(AVG(r.Score)) as avg_rating,
        COUNT(r.Review_id) as rating_count
      FROM Books b
      LEFT JOIN Reviews r ON b.Book_id = r.Book_id
      WHERE LOWER(b.Type) = ?
      GROUP BY b.Book_id, b.Title, b.CoverUrl, b.Type, b.Genre
      ORDER BY avg_rating DESC, rating_count DESC
      LIMIT 4
    `, [type]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching top books by type:', error);
    res.status(500).json({ error: 'Failed to fetch top books by type' });
  }
});

module.exports = { router, setDb };