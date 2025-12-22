import apiFootball from '../src/config/apiFootball.js';
import pool from '../src/config/db.js';

const MATCH_ID = 1347242;

const fetchAndStoreMatch = async () => {
    try {
        console.log(`Fetching match ID: ${MATCH_ID}...`);

        // 1. Fetch Fixture
        const response = await apiFootball.get('/fixtures', {
            params: { id: MATCH_ID }
        });

        const matches = response.data.response;

        if (matches.length === 0) {
            console.error('Match not found!');
            process.exit(1);
        }

        const match = matches[0];
        console.log(`Found match: ${match.teams.home.name} vs ${match.teams.away.name}`);

        // 2. Fetch Lineups
        console.log('Fetching lineups...');
        const lineupsResponse = await apiFootball.get('/fixtures/lineups', {
            params: { fixture: MATCH_ID }
        });
        const lineupsData = lineupsResponse.data.response;
        console.log(`Found ${lineupsData.length} lineups.`);

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            console.log('Clearing existing fixtures, events, and lineups...');
            await connection.query('SET FOREIGN_KEY_CHECKS = 0');
            await connection.query('TRUNCATE TABLE fixture_events');
            await connection.query('TRUNCATE TABLE fixture_lineups');
            await connection.query('TRUNCATE TABLE fixtures');
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');

            console.log('Inserting new match data...');

            const { fixture, league, teams, goals, score } = match;

            // 1. Upsert League
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

            // 4. Insert Fixture
            await connection.query(`
                INSERT INTO fixtures (id, league_id, season, date, status_short, status_long, referee, home_team, away_team, goals_home, goals_away, elapsed)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

            // 5. Insert Events
            if (match.events && match.events.length > 0) {
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

            // 6. Insert Lineups
            if (lineupsData && lineupsData.length > 0) {
                for (const teamLineup of lineupsData) {
                    await connection.query(`
                        INSERT INTO fixture_lineups (fixture_id, team_id, formation, startXI, substitutes, coach)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, [
                        fixture.id,
                        teamLineup.team.id,
                        teamLineup.formation,
                        JSON.stringify(teamLineup.startXI),
                        JSON.stringify(teamLineup.substitutes),
                        JSON.stringify(teamLineup.coach)
                    ]);
                }
            }

            await connection.commit();
            console.log('✅ Match and lineups stored successfully.');

        } catch (err) {
            await connection.rollback();
            console.error('Error storing match:', err);
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Failed to fetch match:', error.message);
    } finally {
        process.exit(0);
    }
};

fetchAndStoreMatch();
