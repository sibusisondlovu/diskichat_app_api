import apiFootball from '../config/apiFootball.js';
import pool from '../config/db.js';

/**
 * Fetch live matches from API-Football and store in DB.
 * Focuses on 'South Africa' matches as per requirements.
 */
export const fetchLiveMatches = async () => {
    try {
        console.log('Fetching live matches...');
        // param live=all to get all live matches, then we filter in code or db.
        // Requirement says: Filter by league.country = "South Africa"
        const response = await apiFootball.get('/fixtures', {
            params: { live: 'all' }
        });

        const liveMatches = response.data.response;

        // Filter for South Africa
        // Note: In production with many matches, might want to ask API for specific leagues, but 'live=all' is standard for "What's on now?"
        const saMatches = liveMatches.filter(match => match.league.country === 'South Africa');

        if (saMatches.length === 0) {
            console.log('No live matches found for South Africa.');
            return [];
        }

        console.log(`Found ${saMatches.length} live matches for South Africa. Updating DB...`);

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            for (const match of saMatches) {
                const { fixture, league, teams, goals, score } = match;

                // 1. Upsert League (Ensure FK exists)
                await connection.query(`
                    INSERT INTO leagues (id, name, type, country, logo, season)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    name=VALUES(name), logo=VALUES(logo), season=VALUES(season)
                `, [league.id, league.name, league.type, league.country, league.logo, league.season]);

                // 2. Upsert Home Team
                await connection.query(`
                    INSERT INTO teams (id, name, country, logo, founded, venue_name, venue_city, venue_capacity)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    name=VALUES(name), logo=VALUES(logo)
                `, [teams.home.id, teams.home.name, 'South Africa', teams.home.logo, null, null, null, null]);

                // 3. Upsert Away Team
                await connection.query(`
                    INSERT INTO teams (id, name, country, logo, founded, venue_name, venue_city, venue_capacity)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    name=VALUES(name), logo=VALUES(logo)
                `, [teams.away.id, teams.away.name, 'South Africa', teams.away.logo, null, null, null, null]);

                // 4. Upsert Fixture
                await connection.query(`
                    INSERT INTO fixtures (id, league_id, season, date, status_short, status_long, referee, home_team, away_team, goals_home, goals_away, elapsed)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    status_short=VALUES(status_short), status_long=VALUES(status_long), 
                    goals_home=VALUES(goals_home), goals_away=VALUES(goals_away),
                    elapsed=VALUES(elapsed),
                    updated_at=NOW()
                `, [
                    fixture.id,
                    league.id,
                    league.season,
                    new Date(fixture.date),
                    fixture.status.short,
                    fixture.status.long,
                    fixture.referee,
                    teams.home.id,
                    teams.away.id,
                    goals.home,
                    goals.away,
                    fixture.status.elapsed
                ]);

                // 5. Upgrade Events (Simple approach: delete all for fixture and re-insert)
                // Note: Real-time efficient approach would be delta updates, but for MVP re-insert is safer to avoid duplicates.
                if (match.events && match.events.length > 0) {
                    await connection.query('DELETE FROM fixture_events WHERE fixture_id = ?', [fixture.id]);

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
            }

            await connection.commit();
            console.log('✅ Live matches updated successfully.');
        } catch (err) {
            await connection.rollback();
            console.error('Error updating live matches:', err);
            throw err;
        } finally {
            connection.release();
        }

        return saMatches;

    } catch (error) {
        console.error('Failed to fetch live matches:', error.message);
        throw error;
    }
};
