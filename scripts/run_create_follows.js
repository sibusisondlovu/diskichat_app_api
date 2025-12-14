import pool from '../src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createTables = async () => {
    try {
        const sqlPath = path.join(__dirname, 'create_user_follows.sql');
        const sqlFile = fs.readFileSync(sqlPath, 'utf8');

        // Split queries by semicolon to execute them one by one (execute doesn't support multiple statements usually unless configured)
        const queries = sqlFile.split(';').filter(q => q.trim().length > 0);

        const connection = await pool.getConnection();

        for (const query of queries) {
            await connection.query(query);
        }

        console.log('✅ User follows tables created successfully.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        process.exit(1);
    }
};

createTables();
