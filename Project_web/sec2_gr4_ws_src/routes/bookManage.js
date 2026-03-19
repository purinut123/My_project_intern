const express = require('express');
const router = express.Router();
const { getOrCreateAuthor, getOrCreatePublisher } = require('../utils/helpers');

function setDb(database) {
  db = database;
}

// Add new book
// Postman test:
// POST http://localhost:8000/books-add
// Body (raw JSON):
// {
//   "title": "Test Book",
//   "type": "manga",
//   "genres": "action, adventure",
//   "rating": "all-ages",
//   "status": "ongoing",
//   "authorName": "Test Author",
//   "publisherName": "Test Publisher"
// }
router.post('/books-add', async (req, res) => {
  const {
    title,
    og_title,
    type,
    synopsis,
    release_year,
    genres,
    read_platform,
    rating,
    status,
    coverUrl,
    authorName,
    publisherName,
  } = req.body;

  // Log what we received
  console.log('Received book data:', req.body);

  // Check required fields
  if (!title || !type || !genres || !rating || !status || !authorName || !publisherName) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields',
      received: req.body 
    });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1) author
    const authorId = await getOrCreateAuthor(conn, authorName);

    // 2) publisher
    const publisherId = await getOrCreatePublisher(conn, publisherName);

    // 3) generate new Book_id
    const [maxRows] = await conn.query(
      "SELECT MAX(CAST(SUBSTRING(Book_id, 2) AS UNSIGNED)) AS maxNum FROM Books"
    );
    const nextNum = (maxRows[0].maxNum || 0) + 1;
    const newBookId = 'B' + String(nextNum).padStart(3, '0');

    // 4) insert into Books
    await conn.query(
      `INSERT INTO Books
        (Book_id, Type, Title, OG_title, Synopsis, Genre, Release_year, Read_platform, Rating, Status_B, CoverUrl, Authors_id, Publishers_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newBookId, type, title, og_title, synopsis, genres, release_year, read_platform, rating, status, coverUrl, authorId, publisherId]
    );

    // if everything's ok, save to db
    await conn.commit();

    res.json({
      success: true,
      bookId: newBookId,
      authorId,
      publisherId
    });
  } catch (err) {
    // if error, undo all changes
    await conn.rollback();
    console.error('Book add error:', err);
    res.status(500).json({ success: false, error: 'Failed to add book' });
  } finally {
    // release connection back to pool
    conn.release();
  }
});

//------------------------------------------------//

// Get book list with pagination and search
// Postman test:
// GET http://localhost:8000/book-list?page=1&limit=10&search=naruto&type=manga
router.get('/book-list', async (req, res) => {
  const { page = 1, limit = 10, search = '', type = '', status = '', rating = '', sort = '' } = req.query;
  
  console.log('Books search:', { page, limit, search, type });

  try {
    const offset = (page - 1) * limit;
    
    // Build WHERE clause based on filters
    let whereClause = '1=1'; // Always true, so we can add AND conditions
    const params = [];
    
    if (search) {
      whereClause += ` AND (b.Title LIKE ? OR b.OG_title LIKE ? OR a.Name LIKE ? OR p.Name LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (type) {
      whereClause += ` AND b.Type = ?`;
      params.push(type);
    }

    if (status) {
      whereClause += ` AND b.Status_B = ?`;
      params.push(status);
    }

    if (rating) {
      whereClause += ` AND b.Rating = ?`;
      params.push(rating);
    }

    let orderBy = 'b.Book_id ASC'; // default
    if (sort === 'Highest rating') {
      orderBy = 'b.Rating DESC';
    } else if (sort === 'Most viewed') {
      orderBy = 'b.Views DESC'; // assuming you have a Views column
    } else if (sort === 'A–Z') {
      orderBy = 'b.Title ASC';
    } else if (sort === 'Latest update') {
      orderBy = 'b.Release_year DESC'; // or use an updated_at column if you have one
    }
    
    // Get total count
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total 
       FROM Books b
       LEFT JOIN Authors a ON b.Authors_id = a.Authors_id
       LEFT JOIN Publishers p ON b.Publishers_id = p.Publishers_id
       WHERE ${whereClause}`,
      params
    );
    const total = countRows[0].total;
    
    // Get paginated results
    const [rows] = await db.query(
      `SELECT b.Book_id, b.Title, b.OG_title, b.Type, b.Synopsis, b.Genre, 
              b.Release_year, b.Read_platform, b.Status_B, b.Rating, b.CoverUrl,
              a.Name as Author_Name, p.Name as Publisher_Name
       FROM Books b
       LEFT JOIN Authors a ON b.Authors_id = a.Authors_id
       LEFT JOIN Publishers p ON b.Publishers_id = p.Publishers_id
       WHERE ${whereClause}
       ORDER BY b.Book_id ASC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('Books search error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch books' 
    });
  }
});

//------------------------------------------------//

// Get single book by ID
// Postman test:
// GET http://localhost:8000/books-find/B001
router.get('/books-find/:id', async (req, res) => {
  const { id } = req.params;
  
  console.log('Fetching book:', id);

  try {
    const [rows] = await db.query(
      `SELECT b.Book_id, b.Title, b.OG_title, b.Type, b.Synopsis, b.Genre, 
              b.Release_year, b.Read_platform, b.Status_B, b.Rating, b.CoverUrl,
              b.Authors_id, b.Publishers_id,
              a.Name as Author_Name, p.Name as Publisher_Name
       FROM Books b
       LEFT JOIN Authors a ON b.Authors_id = a.Authors_id
       LEFT JOIN Publishers p ON b.Publishers_id = p.Publishers_id
       WHERE b.Book_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Book not found' 
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (err) {
    console.error('Get book error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch book' 
    });
  }
});

// Update book
// Postman test:
// PUT http://localhost:8000/books-edit/B001
// Body (raw JSON):
// {
//   "title": "Updated Title",
//   "type": "manga",
//   "status": "completed",
//   ...
// }
router.put('/books-edit/:id', async (req, res) => {
  const { id } = req.params;
  const {
    title, og_title, type, synopsis, release_year, genres,
    read_platform, rating, status, coverUrl, authorName, publisherName
  } = req.body;

  console.log('Updating book:', id);

  // Check required fields
  if (!title || !type || !genres || !rating || !status || !authorName || !publisherName) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields'
    });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Check if book exists
    const [checkBook] = await conn.query(
      'SELECT Book_id FROM Books WHERE Book_id = ?',
      [id]
    );

    if (checkBook.length === 0) {
      await conn.rollback();
      return res.status(404).json({ 
        success: false, 
        error: 'Book not found' 
      });
    }

    // Get or create author
    const authorId = await getOrCreateAuthor(conn, authorName);

    // Get or create publisher
    const publisherId = await getOrCreatePublisher(conn, publisherName);

    // Update book
    await conn.query(
      `UPDATE Books SET
        Title = ?, OG_title = ?, Type = ?, Synopsis = ?, Genre = ?,
        Release_year = ?, Read_platform = ?, Rating = ?, Status_B = ?,
        CoverUrl = ?, Authors_id = ?, Publishers_id = ?
       WHERE Book_id = ?`,
      [title, og_title, type, synopsis, genres, release_year, 
       read_platform, rating, status, coverUrl, authorId, publisherId, id]
    );

    await conn.commit();

    res.json({
      success: true,
      bookId: id,
      message: 'Book updated successfully'
    });

  } catch (err) {
    await conn.rollback();
    console.error('Update book error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update book' 
    });
  } finally {
    conn.release();
  }
});

//-------------------------------------------------//

// Delete book
// Postman test:
// DELETE http://localhost:8000/book-del/B001
router.delete('/book-del/:id', async (req, res) => {
  const { id } = req.params;
  
  console.log('Deleting book:', id);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Check if book exists
    const [checkBook] = await conn.query(
      'SELECT Book_id FROM Books WHERE Book_id = ?',
      [id]
    );

    if (checkBook.length === 0) {
      await conn.rollback();
      return res.status(404).json({ 
        success: false, 
        error: 'Book not found' 
      });
    }

    // Delete related reviews first (foreign key constraint)
    await conn.query(
      'DELETE FROM Reviews WHERE Book_id = ?',
      [id]
    );

    // Delete the book
    await conn.query(
      'DELETE FROM Books WHERE Book_id = ?',
      [id]
    );

    await conn.commit();

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });

  } catch (err) {
    await conn.rollback();
    console.error('Delete book error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete book' 
    });
  } finally {
    conn.release();
  }
});

module.exports = { router, setDb };