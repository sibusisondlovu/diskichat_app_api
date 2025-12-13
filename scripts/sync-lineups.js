import pool from '../src/config/db.js';
import apiFootball from '../src/config/apiFootball.js';

const syncLineups = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('🔄 Syncing lineups...');

        // 1. Get live or recent fixtures from DB
        const [fixtures] = await connection.query(`
            SELECT id FROM fixtures 
            WHERE status_short IN ('1H', '2H', 'HT', 'ET', 'P', 'FT', 'LIVE')
            ORDER BY date DESC 
            LIMIT 50
        `);

        console.log(`Found ${fixtures.length} active/recent fixtures to check for lineups.`);

        for (const fixture of fixtures) {
            try {
                const response = await apiFootball.get('/fixtures/lineups', {
                    params: { fixture: fixture.id }
                });

                const lineups = response.data.response;
                if (!lineups || lineups.length === 0) continue;

                console.log(`Processing lineups for fixture ${fixture.id}: ${lineups.length} teams found.`);

                for (const teamLineup of lineups) {
                    const teamId = teamLineup.team.id;
                    const formation = teamLineup.formation;
                    const startXI = JSON.stringify(teamLineup.startXI);
                    const substitutes = JSON.stringify(teamLineup.substitutes);
                    const coach = JSON.stringify(teamLineup.coach);

                    // Upsert lineup
                    // Check if exists first (cleaner than complicated INSERT ON DUPLICATE for JSON)
                    const [existing] = await connection.query(
                        'SELECT id FROM fixture_lineups WHERE fixture_id = ? AND team_id = ?',
                        [fixture.id, teamId]
                    );

                    if (existing.length > 0) {
                        await connection.query(
                            `UPDATE fixture_lineups 
                             SET formation = ?, startXI = ?, substitutes = ?, coach = ? 
                             WHERE id = ?`,
                            [formation, startXI, substitutes, coach, existing[0].id]
                        );
                    } else {
                        await connection.query(
                            `INSERT INTO fixture_lineups (fixture_id, team_id, formation, startXI, substitutes, coach)
                             VALUES (?, ?, ?, ?, ?, ?)`,
                            [fixture.id, teamId, formation, startXI, substitutes, coach]
                        );
                    }
                }
            } catch (err) {
                console.error(`Error fetching lineups for fixture ${fixture.id}:`, err.message);
            }
        }

        console.log('✅ Lineups sync complete.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
};

syncLineups();
