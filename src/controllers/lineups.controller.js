import pool from "../config/db.js";

/**
 * GET /api/lineups/:fixtureId
 * Get lineups for a specific fixture
 */
export const getLineups = async (req, res) => {
    try {
        const { fixtureId } = req.params;
        const connection = await pool.getConnection();

        const [rows] = await connection.query(
            `SELECT * FROM fixture_lineups WHERE fixture_id = ?`,
            [fixtureId]
        );

        connection.release();

        if (rows.length === 0) {
            return res.json({ success: true, lineups: [] });
        }

        // Parse JSON fields back to objects
        const lineups = rows.map(row => ({
            ...row,
            startXI: typeof row.startXI === 'string' ? JSON.parse(row.startXI) : row.startXI,
            substitutes: typeof row.substitutes === 'string' ? JSON.parse(row.substitutes) : row.substitutes,
            coach: typeof row.coach === 'string' ? JSON.parse(row.coach) : row.coach,
        }));

        res.json({
            success: true,
            lineups: lineups
        });

    } catch (err) {
        console.error("Error fetching lineups:", err);
        res.status(500).json({ error: "Failed to fetch lineups" });
    }
};
