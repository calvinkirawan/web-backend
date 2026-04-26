import mysql from 'mysql2'; // Changed from require

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db'
});

export default pool.promise(); // Changed from module.exports