import pool from '../src/config/db.js';

const migrateElapsed = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('🔄 Migrating DB to add "elapsed" column to fixtures...');

        try {
            await connection.query(`
                ALTER TABLE fixtures 
                ADD COLUMN elapsed INT DEFAULT 0
            `);
            console.log('✅ Column "elapsed" added to "fixtures".');
        } catch (err) {
            // Check if error is "Duplicate column name"
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Column "elapsed" already exists.');
            } else {
                throw err;
            }
        }

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateElapsed();
