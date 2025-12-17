import pool from "../config/db.js";

/**
 * GET /api/matches
 * Return all matches from the database.
 */
export const getMatches = async (req, res) => {
    try {
        const connection = await pool.getConnection();

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
                f.home_team as home_team_id,
                ht.name as home_team,
                ht.logo as home_logo,
                f.away_team as away_team_id,
                at.name as away_team,
                at.logo as away_logo
            FROM fixtures f
            JOIN leagues l ON f.league_id = l.id
            JOIN teams ht ON f.home_team = ht.id
            JOIN teams at ON f.away_team = at.id
            ORDER BY f.date DESC
        `;

        const [rows] = await connection.query(query);

        // Fetch events for these fixtures
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
        console.error("Error fetching matches:", err);
        res.status(500).json({ error: "Failed to fetch matches" });
    }
};
