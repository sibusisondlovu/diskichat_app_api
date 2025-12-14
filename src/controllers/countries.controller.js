import pool from "../config/db.js";

/**
 * GET /api/countries
 * Returns active countries.
 */
export const getActiveCountries = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`
            SELECT * FROM countries 
            WHERE is_active = TRUE 
            ORDER BY name ASC
        `);

        connection.release();

        res.json({
            success: true,
            count: rows.length,
            countries: rows
        });
    } catch (err) {
        console.error("Error fetching countries:", err);
        res.status(500).json({ error: "Failed to fetch countries" });
    }
};
