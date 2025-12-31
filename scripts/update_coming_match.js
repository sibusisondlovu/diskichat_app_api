import apiFootball from '../src/config/apiFootball.js';
import pool from '../src/config/db.js';

const fetchAndStoreComingMatch = async () => {
    try {
        console.log('Fetching coming match (League 6, Season 2025, Next 1)...');

        const response = await apiFootball.get('/fixtures', {
            params: {
                league: 6,
                season: 2025,
                next: 1
            }
        });

        const matches = response.data.response;

        if (matches.length === 0) {
            console.log('No coming matches found.');
            process.exit(0);
        }

        console.log(`Found ${matches.length} coming match(es). Updating DB...`);

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            for (const match of matches) {
                const { fixture, league, teams, goals, score } = match;

                console.log(`Processing match: ${teams.home.name} vs ${teams.away.name} at ${fixture.date}`);

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

                // 4. Upsert Fixture
                await connection.query(`
                    INSERT INTO fixtures (id, league_id, season, date, status_short, status_long, referee, home_team, away_team, goals_home, goals_away, elapsed)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    league_id=VALUES(league_id),
                    season=VALUES(season),
                    date=VALUES(date),
                    status_short=VALUES(status_short),
                    status_long=VALUES(status_long),
                    referee=VALUES(referee),
                    home_team=VALUES(home_team),
                    away_team=VALUES(away_team),
                    goals_home=VALUES(goals_home),
                    goals_away=VALUES(goals_away),
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
            }

            await connection.commit();
            console.log('✅ Coming match updated successfully.');

        } catch (err) {
            await connection.rollback();
            console.error('Error updating coming match:', err);
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Failed to fetch coming match:', error.message);
    } finally {
        process.exit(0);
    }
};

fetchAndStoreComingMatch();
