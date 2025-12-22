import apiFootball from '../config/apiFootball.js';
import pool from '../config/db.js';

const MATCH_ID = 1347242;

export const updateMatchData = async () => {
    try {
        // 0. Check if match is finished in DB to avoid unnecessary API calls
        const [rows] = await pool.query('SELECT status_short FROM fixtures WHERE id = ?', [MATCH_ID]);
        if (rows.length > 0) {
            const status = rows[0].status_short;
            if (['FT', 'AET', 'PEN'].includes(status)) {
                console.log(`⏹️ Update Service: Match ${MATCH_ID} is finished (${status}). Skipping update.`);
                return;
            }
        }

        console.log(`🔄 Update Service: Fetching match ID: ${MATCH_ID}...`);

        const response = await apiFootball.get('/fixtures', {
            params: { id: MATCH_ID }
        });

        const matches = response.data.response;

        if (matches.length === 0) {
            console.error('❌ Update Service: Match not found!');
            return;
        }

        const match = matches[0];
        const { fixture, teams, goals, score } = match; // league is static for this match

        console.log(`Update Service: Updating ${teams.home.name} vs ${teams.away.name} (${fixture.status.short})`);

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Update Fixture (Status, Score, Elapsed, Time)
            await connection.query(`
                UPDATE fixtures 
                SET 
                    status_short = ?,
                    status_long = ?,
                    goals_home = ?,
                    goals_away = ?,
                    elapsed = ?,
                    date = ?,
                    updated_at = NOW()
                WHERE id = ?
            `, [
                fixture.status.short,
                fixture.status.long,
                goals.home,
                goals.away,
                fixture.status.elapsed,
                new Date(fixture.date),
                fixture.id
            ]);

            // 2. Update Events (Replace all)
            if (match.events && match.events.length > 0) {
                // Delete existing events
                await connection.query('DELETE FROM fixture_events WHERE fixture_id = ?', [fixture.id]);

                // Insert new events
                for (const event of match.events) {
                    await connection.query(`
                        INSERT INTO fixture_events (fixture_id, team_id, player, type, detail, minutes, extra)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                     `, [
                        fixture.id,
                        event.team.id,
                        event.player.name,
                        event.type,
                        event.detail,
                        event.time.elapsed,
                        event.time.extra
                    ]);
                }
            }

            await connection.commit();
            console.log('✅ Update Service: Match updated successfully.');

        } catch (err) {
            await connection.rollback();
            console.error('❌ Update Service: Error updating database:', err);
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ Update Service: Failed to fetch match:', error.message);
    }
};
