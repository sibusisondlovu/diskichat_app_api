import pool from '../src/config/db.js';

const clearTeams = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('DELETE FROM teams');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Teams table cleared successfully (TRUNCATED/DELETED with FK disabled).');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing teams table:', error);
        process.exit(1);
    }
};

clearTeams();
