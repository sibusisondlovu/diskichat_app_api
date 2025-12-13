import pool from "../config/db.js";

/**
 * GET /api/teams
 * Return all South African teams from database.
 */
export const getTeamsSA = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const query = `
            SELECT * FROM teams 
            WHERE country = 'South Africa'
            ORDER BY name ASC
        `;

        const [rows] = await connection.query(query);
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
