import pool from "../config/db.js";

/**
 * GET /api/teams
 * Return all South African teams from database.
 */
export const getTeamsSA = async (req, res) => {
    try {
        const { country } = req.query; // Capture country param
        const connection = await pool.getConnection();

        let query = `SELECT * FROM teams WHERE 1=1`;
        const params = [];

        if (country) {
            query += ` AND country = ?`;
            params.push(country);
        }

        query += ` ORDER BY name ASC`;

        const [rows] = await connection.query(query, params);
        connection.release();

        res.json({
            success: true,
            count: rows.length,
            teams: rows
        });
    } catch (err) {
        console.error("Error fetching teams:", err);
        res.status(500).json({ error: "Failed to fetch teams" });
    }
};
