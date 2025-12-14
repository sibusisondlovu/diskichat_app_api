import pool from '../src/config/db.js';

const checkSchema = async () => {
    try {
        const [rows] = await pool.query('DESCRIBE teams');
        console.log('Teams Table Schema:', rows);
        const [compRows] = await pool.query('DESCRIBE leagues'); // Assuming table is 'leagues' based on service
        console.log('Leagues Table Schema:', compRows);
        process.exit(0);
    } catch (error) {
        console.error('Error describing tables:', error);
        process.exit(1);
    }
};

checkSchema();
