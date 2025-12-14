import pool from '../src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const alterTable = async () => {
    try {
        const sqlPath = path.join(__dirname, 'alter_teams_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await pool.query(sql);
        console.log('✅ Teams table altered successfully (added code column).');
        process.exit(0);
    } catch (error) {
        if (error.errno === 1060) {
            console.log('ℹ️ Column "code" already exists. Skipping.');
            process.exit(0);
        }
        console.error('❌ Error altering table:', error);
        process.exit(1);
    }
};

alterTable();
