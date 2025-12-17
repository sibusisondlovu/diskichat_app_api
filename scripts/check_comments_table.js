import pool from '../src/config/db.js';

const checkTable = async () => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query("SHOW TABLES LIKE 'comments'");
        connection.release();

        if (rows.length > 0) {
            console.log("✅ Table 'comments' exists.");

            // Check columns
            const connection2 = await pool.getConnection();
            const [cols] = await connection2.query("DESCRIBE comments");
            connection2.release();
            console.log("Columns:", cols.map(c => c.Field).join(", "));
        } else {
            console.log("❌ Table 'comments' DOES NOT exist.");
        }
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkTable();
