const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'weather_app',
  connectionLimit: 10,  // Maximum 10 concurrent connections
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
  waitForConnections: true,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('✓ MySQL Connected Successfully');
    conn.release();
  })
  .catch(err => {
    console.error('✗ MySQL Connection Failed:', err.message);
  });

module.exports = pool;