import apiFootball from '../src/config/apiFootball.js';
import pool from '../src/config/db.js';

const run = async () => {
    try {
        console.log('Fetching live matches (global)...');
        const response = await apiFootball.get('/fixtures', { params: { live: 'all' } });
        const matches = response.data.response;

        if (!matches || matches.length === 0) {
            console.log('No live matches found anywhere in the world currently!');
            process.exit(0);
        }

        // Pick the first one
        const match = matches[0];
        console.log(`Found live match: ${match.teams.home.name} vs ${match.teams.away.name} (${match.league.name}, ${match.league.country})`);

        const { fixture, league, teams, goals, score } = match;
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. League
            await connection.query(`
            INSERT INTO leagues (id, name, type, country, logo, season)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name=VALUES(name), logo=VALUES(logo), season=VALUES(season)
        `, [league.id, league.name, league.type, league.country, league.logo, league.season]);

            // 2. Home Team
            await connection.query(`
            INSERT INTO teams (id, name, country, logo, founded, venue_name, venue_city, venue_capacity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name=VALUES(name), logo=VALUES(logo)
        `, [teams.home.id, teams.home.name, teams.home.country || 'World', teams.home.logo, null, null, null, null]);

            // 3. Away Team
            await connection.query(`
            INSERT INTO teams (id, name, country, logo, founded, venue_name, venue_city, venue_capacity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name=VALUES(name), logo=VALUES(logo)
        `, [teams.away.id, teams.away.name, teams.away.country || 'World', teams.away.logo, null, null, null, null]);

            // 4. Fixture
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

            // 5. Events
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

            await connection.commit();
            console.log(`✅ Successfully inserted match ID ${fixture.id} into database.`);
            console.log(`Status: ${fixture.status.short} (${fixture.status.elapsed}')`);
        } catch (err) {
            await connection.rollback();
            console.error('DB Error:', err);
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Script Error:', error.message);
    } finally {
        process.exit();
    }
};

run();
