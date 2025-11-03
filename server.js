const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve frontend files if present

// MySQL config and pool (initialized in init)
const MYSQL_HOST = 'localhost';
const MYSQL_USER = 'root';
const MYSQL_PASSWORD = 'anitha2302';
const MYSQL_DATABASE = 'budget_tracker';

let pool; // assigned after ensuring database exists

// Initialize Database
async function initDB() {
  try {
    // Ensure database exists first
    const bootstrap = await mysql.createConnection({
      host: MYSQL_HOST,
      user: root,
      password: anitha2302
    });
    await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\``);
    await bootstrap.end();

    // Create pool for the target database
    pool = mysql.createPool({
      host: MYSQL_HOST,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const conn = await pool.getConnection();
    
    // Create users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        income DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create categories table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        budget DECIMAL(10,2) DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create transactions table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        description VARCHAR(255),
        category VARCHAR(50),
        amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    conn.release();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Routes

// Lightweight health check (does not touch DB)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve the HTML from project root if no public/ dir
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'budget_tracker.html'));
});

// Serve analytics page
app.get('/analytics', (req, res) => {
  res.sendFile(path.join(__dirname, 'analytics.html'));
});

// Get or create user
app.post('/api/user', async (req, res) => {
  try {
    const { username } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (rows.length > 0) {
      return res.json(rows[0]);
    }
    
    const [result] = await pool.query('INSERT INTO users (username) VALUES (?)', [username]);
    const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    
    // Create default categories
    const defaultCategories = [
      ['Food', 8000],
      ['Transport', 3000],
      ['Rent', 12000],
      ['Shopping', 4000],
      ['Entertainment', 2500],
      ['Utilities', 3500],
      ['Other', 2000]
    ];
    
    for (const [name, budget] of defaultCategories) {
      await pool.query('INSERT INTO categories (user_id, name, budget) VALUES (?, ?, ?)', 
        [result.insertId, name, budget]);
    }
    
    res.json(newUser[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update income
app.put('/api/user/:userId/income', async (req, res) => {
  try {
    const { userId } = req.params;
    const { income } = req.body;
    await pool.query('UPDATE users SET income = ? WHERE id = ?', [income, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get categories
app.get('/api/user/:userId/categories', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query('SELECT * FROM categories WHERE user_id = ?', [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update category budget
app.put('/api/category/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { budget } = req.body;
    await pool.query('UPDATE categories SET budget = ? WHERE id = ?', [budget, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all transactions
app.get('/api/user/:userId/transactions', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add transaction
app.post('/api/user/:userId/transactions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, description, category, amount } = req.body;
    const [result] = await pool.query(
      'INSERT INTO transactions (user_id, date, description, category, amount) VALUES (?, ?, ?, ?, ?)',
      [userId, date, description, category, amount]
    );
    const [newTxn] = await pool.query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);
    res.json(newTxn[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update transaction
app.put('/api/transaction/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, description, category, amount } = req.body;
    await pool.query(
      'UPDATE transactions SET date = ?, description = ?, category = ?, amount = ? WHERE id = ?',
      [date, description, category, amount, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete transaction
app.delete('/api/transaction/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM transactions WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get weekly expenses
app.get('/api/user/:userId/weekly-expenses', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(date, '%Y-%u') as week,
        YEARWEEK(date, 1) as week_num,
        SUM(amount) as total
      FROM transactions
      WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
      GROUP BY week, week_num
      ORDER BY week_num DESC
      LIMIT 12
    `, [userId]);
    res.json(rows.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset user data
app.delete('/api/user/:userId/reset', async (req, res) => {
  try {
    const { userId } = req.params;
    await pool.query('DELETE FROM transactions WHERE user_id = ?', [userId]);
    await pool.query('UPDATE users SET income = 0 WHERE id = ?', [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});