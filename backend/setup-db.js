require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;


const pool = mysql.createPool({
  host: '',
  port: 26398,
  user: 'avnadmin',
  password: 'A',
  database: 'defaultdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

/* 🔥 DATABASE SETUP ROUTE */
app.get('/setup', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_key VARCHAR(16) NOT NULL,
        recipient_key VARCHAR(16) NOT NULL,
        encrypted_data TEXT NOT NULL,
        garbage_noise TEXT,
        timestamp DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS device_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        device_key VARCHAR(16) UNIQUE NOT NULL,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    res.json({
      status: "success",
      message: "Database tables created successfully"
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

/* HEALTH CHECK */
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'online',
      database: 'connected'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Setup Server running on port ${PORT}`);
});
