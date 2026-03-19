require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();

// Middleware to read JSON from fetch()
app.use(express.json());
// in case of normal forms (no fetch)
app.use(express.urlencoded({ extended: true }));

// Database connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Import route modules
const bookManage = require('./routes/bookManage');
const bookDisplay = require('./routes/bookDisplay');
const userManage = require('./routes/userManage');
const authRoutes = require('./routes/authRoutes');
const reviewRating = require('./routes/Review-Rating');

// Pass database connection to routes
bookManage.setDb(db);
bookDisplay.setDb(db);
userManage.setDb(db);
authRoutes.setDb(db);
reviewRating.setDb(db);

// Use routes (no /api prefix since frontend proxy handles it)
app.use('/', bookManage.router);
app.use('/', bookDisplay.router);
app.use('/', userManage.router);
app.use('/', authRoutes.router);
app.use('/', reviewRating.router);

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
