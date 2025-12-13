import pool from "../config/db.js";

/**
 * GET /api/live
 * Return all live matches from the database (sourced via cron).
 * Filters for status_short = "LIVE" or similar, and league.country="South Africa".
 */
export const getLiveMatches = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        // Query for live matches in South Africa
        // Note: 'status_short' depends on API-Football values (1H, 2H, HT, etc.). 
        // For simplicity, we fetch all from DB that were marked as live during ingestion.
        // However, the best way is to join fixtures with leagues/teams to return full structure.

        const query = `
            SELECT 
                f.id as fixture_id,
                f.season,
                f.date,
                f.status_short,
                f.status_long,
                f.goals_home,
                f.goals_away,
                f.elapsed,
                f.updated_at,
                l.name as league_name,
                l.country as league_country,
                l.logo as league_logo,
                ht.name as home_team,
                ht.logo as home_logo,
                at.name as away_team,
                at.logo as away_logo
            FROM fixtures f
            JOIN leagues l ON f.league_id = l.id
            JOIN teams ht ON f.home_team = ht.id
            JOIN teams at ON f.away_team = at.id
            -- WHERE l.country = 'South Africa'
            ORDER BY f.date ASC
        `;

        const [rows] = await connection.query(query);

        // Fetch events for these fixtures
        // A optimized way is 1 query with IN clause or JSON_ARRAYAGG, but loop is okay for MVP live matches (usually small number).
        // Let's attach events.

        const matchesWithEvents = await Promise.all(rows.map(async (match) => {
            const [events] = await connection.query('SELECT * FROM fixture_events WHERE fixture_id = ?', [match.fixture_id]);
            return { ...match, events };
        }));

        connection.release();

        res.json({
            success: true,
            count: matchesWithEvents.length,
            matches: matchesWithEvents
        });

    } catch (err) {
        console.error("Error fetching live matches:", err);
        res.status(500).json({ error: "Failed to fetch live matches" });
    }
};
