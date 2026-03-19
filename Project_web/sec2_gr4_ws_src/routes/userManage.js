const express = require('express');
const router = express.Router();

let db;

function setDb(database) {
  db = database;
}

// Add new user/admin
// Postman test:
// POST http://localhost:8000/users-add
// Body (raw JSON):
// {
//  "name": "John",
//  "surname": "Doe",
//  "username": "john_doe",
// "status": "Active",
// "email": "john@example.com",
// "password": "admin123",
// "role": "admin",
//  "gender": "M",
//  "birthdate": "1985-05-15",
//  "profile": "https://example.com/jane.jpg",
//  "telno": "0812345678",
//  "location": "Bangkok"
//}
router.post('/users-add', async (req, res) => {
  const {
    name,
    surname,
    username,
    status,
    email,
    password,
    role,
    gender,
    birthdate,
    profile,
    telno,
    location,
  } = req.body;
  
  // Log what we received
  console.log('Received user data:', req.body);

  // Check required fields
  if (!name || !surname || !username || !status || !email || !password || !role) {
    if (role === 'admin' && (!telno || !location)) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields for admin',
        received: req.body 
      });
    }
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields',
      received: req.body 
    });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // generate new Accounts_id
    const [maxACRows] = await conn.query(
      "SELECT MAX(CAST(SUBSTRING(Account_id, 3) AS UNSIGNED)) AS maxNum FROM Accounts"
    );
    const nextACNum = (maxACRows[0].maxNum || 0) + 1;
    const newAccountId = 'AC' + String(nextACNum).padStart(3, '0');

    // generate new User_id
    const [maxUserRows] = await conn.query(
      "SELECT MAX(CAST(SUBSTRING(User_id, 2) AS UNSIGNED)) AS maxNum FROM Users"
    );
    const nextUserNum = (maxUserRows[0].maxNum || 0) + 1;
    const newUserId = 'U' + String(nextUserNum).padStart(3, '0');

    // generate new Admin_id if admin
    let newAdminId = null;
    if (role === 'admin') {
      const [maxAdminRows] = await conn.query(
        "SELECT MAX(CAST(SUBSTRING(Admin_id, 2) AS UNSIGNED)) AS maxNum FROM Admins"
      );
      const nextAdminNum = (maxAdminRows[0].maxNum || 0) + 1;
      newAdminId = 'A' + String(nextAdminNum).padStart(3, '0');
    }

    // insert into Accounts
    await conn.query(
      `INSERT INTO Accounts
        (Account_id, Password, Email, Role, Status_A)
        VALUES (?, ?, ?, ?, ?)`,
      [newAccountId, password, email, role, status]
    );  

    // insert into Users
    await conn.query(
      `INSERT INTO Users
        (User_id, Account_id, Username, Name, Surname, Gender, ProfileUrl, Birthdate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newUserId, newAccountId, username, name, surname, gender, profile, birthdate]
    );

    if (role === 'admin') {
      await conn.query(
        `INSERT INTO Admins
          (Admin_id, Account_id, User_id, Telno, Location)
          VALUES (?, ?, ?, ?, ?)`,
        [newAdminId, newAccountId, newUserId, telno, location]
      );
    } 

    // if everything's ok, save to db
    await conn.commit();

    res.json({
      success: true,
      accountId: newAccountId,
      userId: newUserId,
      adminId: newAdminId
    });
  } catch (err) {
    // if error, undo all changes
    await conn.rollback();
    console.error('User add error:', err);
    res.status(500).json({ success: false, error: 'Failed to add user' });
  } finally {
    // release connection back to pool
    conn.release();
  }
});

//-----------------------------------------------//

// Get user list with pagination, search, and role filter
// Postman test:
// GET http://localhost:8000/user-list?page=1&limit=10&search=john&role=admin
router.get('/user-list', async (req, res) => {
  const { page = 1, limit = 10, search = '', role = '' } = req.query;
  
  console.log('Users search:', { page, limit, search, role });

  try {
    const offset = (page - 1) * limit;
    
    // Build WHERE clause based on filters
    let whereClause = '1=1';
    const params = [];
    
    if (search) {
      whereClause += ` AND (u.Username LIKE ? OR u.Name LIKE ? OR u.Surname LIKE ? OR a.Email LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (role) {
      whereClause += ` AND a.Role = ?`;
      params.push(role);
    }
    
    // Get total count
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total 
       FROM Users u
       INNER JOIN Accounts a ON u.Account_id = a.Account_id
       WHERE ${whereClause}`,
      params
    );
    const total = countRows[0].total;
    
    // Get paginated results
    const [rows] = await db.query(
      `SELECT u.User_id, u.Username, u.Name, u.Surname, u.Gender, 
              u.ProfileUrl, u.Birthdate,
              a.Account_id, a.Email, a.Role, a.Status_A
       FROM Users u
       INNER JOIN Accounts a ON u.Account_id = a.Account_id
       WHERE ${whereClause}
       ORDER BY u.User_id ASC
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
    console.error('Users search error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch users' 
    });
  }
});

//-----------------------------------------------//

// Get single user by ID
// Postman test:
// GET http://localhost:8000/user-find/U001
router.get('/user-find/:id', async (req, res) => {
  const { id } = req.params;
  
  console.log('Fetching user:', id);

  try {
    const [rows] = await db.query(
      `SELECT u.User_id, u.Username, u.Name, u.Surname, u.Gender, 
              u.ProfileUrl, u.Birthdate,
              a.Account_id, a.Email, a.Password, a.Role, a.Status_A,
              ad.Admin_id, ad.Telno, ad.Location
       FROM Users u
       INNER JOIN Accounts a ON u.Account_id = a.Account_id
       LEFT JOIN Admins ad ON u.User_id = ad.User_id
       WHERE u.User_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user' 
    });
  }
});

// Update user
// Postman test:
// PUT http://localhost:8000/user-edit/U001
// Body (raw JSON):
//{
//  "name": "John",
//  "surname": "Updated",
//  "username": "john_updated",
//  "status": "Active",
//  "email": "john.updated@example.com",
//  "role": "user",
//  "gender": "M",
//  "birthdate": "1990-01-01",
//  "profileUrl": "https://example.com/new-profile.jpg"
//}
router.put('/user-edit/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name, surname, username, status, email, password, role,
    gender, birthdate, profileUrl, telno, location
  } = req.body;
  
  console.log('Updating user:', id);

  // Check required fields
  if (!name || !surname || !username || !status || !email || !role) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields'
    });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Get user's account_id
    const [userRows] = await conn.query(
      'SELECT Account_id FROM Users WHERE User_id = ?',
      [id]
    );

    if (userRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const accountId = userRows[0].Account_id;

    // Update Accounts table
    const updateAccountQuery = password 
      ? 'UPDATE Accounts SET Email = ?, Password = ?, Role = ?, Status_A = ? WHERE Account_id = ?'
      : 'UPDATE Accounts SET Email = ?, Role = ?, Status_A = ? WHERE Account_id = ?';
    
    const accountParams = password
      ? [email, password, role, status, accountId]
      : [email, role, status, accountId];

    await conn.query(updateAccountQuery, accountParams);

    // Update Users table
    await conn.query(
      `UPDATE Users SET
        Username = ?, Name = ?, Surname = ?, Gender = ?,
        ProfileUrl = ?, Birthdate = ?
       WHERE User_id = ?`,
      [username, name, surname, gender, profileUrl, birthdate, id]
    );

    // Update Admins table if role is admin
    if (role === 'admin') {
      // Check if admin record exists
      const [adminRows] = await conn.query(
        'SELECT Admin_id FROM Admins WHERE User_id = ?',
        [id]
      );

      if (adminRows.length > 0) {
        // Update existing admin
        await conn.query(
          'UPDATE Admins SET Telno = ?, Location = ? WHERE User_id = ?',
          [telno, location, id]
        );
      } else {
        // Create new admin record
        const [maxAdminRows] = await conn.query(
          "SELECT MAX(CAST(SUBSTRING(Admin_id, 2) AS UNSIGNED)) AS maxNum FROM Admins"
        );
        const nextAdminNum = (maxAdminRows[0].maxNum || 0) + 1;
        const newAdminId = 'A' + String(nextAdminNum).padStart(3, '0');

        await conn.query(
          'INSERT INTO Admins (Admin_id, Account_id, User_id, Telno, Location) VALUES (?, ?, ?, ?, ?)',
          [newAdminId, accountId, id, telno, location]
        );
      }
    } else {
      // If changing from admin to user, delete admin record
      await conn.query('DELETE FROM Admins WHERE User_id = ?', [id]);
    }

    await conn.commit();

    res.json({
      success: true,
      userId: id,
      message: 'User updated successfully'
    });

  } catch (err) {
    await conn.rollback();
    console.error('Update user error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user' 
    });
  } finally {
    conn.release();
  }
});

//-----------------------------------------------//

// Delete user
// Postman test:
// DELETE http://localhost:8000/user-del/U001
router.delete('/user-del/:id', async (req, res) => {
  const { id } = req.params;
  
  console.log('Deleting user:', id);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Get user's account_id
    const [userRows] = await conn.query(
      'SELECT Account_id FROM Users WHERE User_id = ?',
      [id]
    );

    if (userRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const accountId = userRows[0].Account_id;

    // Delete related records (respect foreign key constraints)
    // 1. Delete reviews by this user
    await conn.query(
      'DELETE FROM Reviews WHERE Account_id = ?',
      [accountId]
    );

    // 2. Delete admin record if exists
    await conn.query(
      'DELETE FROM Admins WHERE User_id = ?',
      [id]
    );

    // 3. Delete user record
    await conn.query(
      'DELETE FROM Users WHERE User_id = ?',
      [id]
    );

    // 4. Delete account record
    await conn.query(
      'DELETE FROM Accounts WHERE Account_id = ?',
      [accountId]
    );

    await conn.commit();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (err) {
    await conn.rollback();
    console.error('Delete user error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete user' 
    });
  } finally {
    conn.release();
  }
});
module.exports = { router, setDb };
