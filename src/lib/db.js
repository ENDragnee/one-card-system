// lib/db.js
import mysql from 'mysql2/promise';
const caPem = Buffer.from(process.env.MYSQL_CA_PEM || '', 'base64').toString('utf-8');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  ssl: false,
});

// Test the connection
const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
};

// Only run the test in development
if (process.env.NODE_ENV === 'development') {
  testConnection();
}

export default db;