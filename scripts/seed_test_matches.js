import pool from '../src/config/db.js';

const run = async () => {
    const connection = await pool.getConnection();
    try {
        console.log('Inserting 5 test matches...');
        await connection.beginTransaction();

        // Common league
        await connection.query(`
            INSERT INTO leagues (id, name, type, country, logo, season)
            VALUES (9999, 'Test League', 'Cup', 'World', 'https://media.api-sports.io/football/leagues/2.png', 2024)
            ON DUPLICATE KEY UPDATE name=VALUES(name)
        `);

        // Generate 5 matches
        for (let i = 1; i <= 5; i++) {
            const fixtureId = 88880 + i;
            const homeId = 77770 + i;
            const awayId = 66660 + i;

            // Home Team
            await connection.query(`
                INSERT INTO teams (id, name, country, logo, founded, venue_name, venue_city, venue_capacity)
                VALUES (?, ?, 'World', 'https://media.api-sports.io/football/teams/33.png', null, null, null, null)
                ON DUPLICATE KEY UPDATE name=VALUES(name)
            `, [homeId, `Test Home ${i}`]);

            // Away Team
            await connection.query(`
                INSERT INTO teams (id, name, country, logo, founded, venue_name, venue_city, venue_capacity)
                VALUES (?, ?, 'World', 'https://media.api-sports.io/football/teams/34.png', null, null, null, null)
                ON DUPLICATE KEY UPDATE name=VALUES(name)
            `, [awayId, `Test Away ${i}`]);

            // Fixture (Live)
            await connection.query(`
                INSERT INTO fixtures (id, league_id, season, date, status_short, status_long, referee, home_team, away_team, goals_home, goals_away, elapsed)
                VALUES (?, 9999, 2024, NOW(), '1H', 'First Half', 'Ref Test', ?, ?, 1, 0, 15)
                ON DUPLICATE KEY UPDATE status_short='1H', updated_at=NOW()
            `, [fixtureId, homeId, awayId]);
        }

        await connection.commit();
        console.log('✅ 5 Live Test Matches inserted.');

    } catch (err) {
        await connection.rollback();
        console.error('Error:', err);
    } finally {
        connection.release();
        process.exit();
    }
};

run();
