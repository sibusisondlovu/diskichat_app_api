import pool from "../config/db.js";

/**
 * GET /api/competitions
 * Return all competitions for African countries.
 */
export const getAfricaCompetitions = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        // The ingestion service populated the leagues table for the list of African countries.
        // We just need to query all or filter by the specific list if needed.
        // Since we only ingest African leagues, SELECT * is fine, but we can respect the list order if we want.

        const query = `
            SELECT * FROM leagues 
            ORDER BY country ASC, name ASC
        `;

        const [rows] = await connection.query(query);
        connection.release();

        res.json({
            success: true,
            count: rows.length,
            competitions: rows
        });
    } catch (err) {
        console.error("Error fetching competitions:", err);
        res.status(500).json({ error: "Failed to fetch competitions" });
    }
};
