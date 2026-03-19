const express = require('express');
const router = express.Router();

let db;

function setDb(database) {
  db = database;
}

// Login endpoint
// Postman test:
// POST http://localhost:8000/login
// Body (raw JSON):
// {
//   "email": "ACCT@211.email.com",
//   "password": "ACa"
// }
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Login attempt:', email);

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and password are required' 
    });
  }

  try {
    // Check if account exists and password matches
    const [rows] = await db.query(
      `SELECT a.Account_id, a.Email, a.Role, a.Status_A, 
              u.User_id, u.Username, u.Name, u.Surname, u.ProfileUrl
       FROM Accounts a
       LEFT JOIN Users u ON a.Account_id = u.Account_id
       WHERE a.Email = ? AND a.Password = ?`,
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    const user = rows[0];

    // Check if account is suspended
    if (user.Status_A === 'Suspended') {
      return res.status(403).json({ 
        success: false, 
        error: 'Account is suspended' 
      });
    }

    // Successful login
    res.json({
      success: true,
      user: {
        accountId: user.Account_id,
        userId: user.User_id,
        email: user.Email,
        username: user.Username,
        name: user.Name,
        surname: user.Surname,
        role: user.Role,
        profileUrl: user.ProfileUrl
      },
      token: user.Account_id // Simple token 
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during login' 
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports = { router, setDb };