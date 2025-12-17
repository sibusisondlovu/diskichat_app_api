import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import axios from 'axios';

dotenv.config();

// Configuration
const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io';
// Remove 'https://' if present
const cleanHost = API_HOST.replace('https://', '').replace('http://', '');
const API_URL = `https://${cleanHost}`;

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : null,
};

async function getDbConnection() {
    return await mysql.createConnection(dbConfig);
}

// ------------------------------------------------------------------
// API Helpers
// ------------------------------------------------------------------

async function fetchFromApi(endpoint, params) {
    try {
        const response = await axios.get(`${API_URL}/${endpoint}`, {
            params: params,
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': cleanHost
            }
        });
        return response.data.response;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error.message);
        return [];
    }
}

// ------------------------------------------------------------------
// Main Logic
// ------------------------------------------------------------------

async function fetchAndSaveEvents(connection, fixtureId) {
    console.log(`   -> Fetching events for fixture ${fixtureId}...`);
    const events = await fetchFromApi('fixtures/events', { fixture: fixtureId });
    if (!events || events.length === 0) return;

    for (const event of events) {
        // Schema: fixture_id, team_id, player, type, detail, minutes, extra
        await connection.query(`
            INSERT INTO fixture_events (fixture_id, team_id, player, type, detail, minutes, extra)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            fixtureId,
            event.team.id,
            event.player.name,
            event.type,
            event.detail,
            event.time.elapsed,
            event.time.extra ? event.time.extra.toString() : null
        ]);
    }
    console.log(`   -> Saved ${events.length} events.`);
}

async function fetchAndSaveLineups(connection, fixtureId) {
    console.log(`   -> Fetching lineups for fixture ${fixtureId}...`);
    const lineups = await fetchFromApi('fixtures/lineups', { fixture: fixtureId });
    if (!lineups || lineups.length === 0) return;

    for (const side of lineups) {
        // Schema: fixture_id, team_id, formation, startXI (json), substitutes (json), coach (json)
        // API returns startXI as array of objects.
        await connection.query(`
            INSERT INTO fixture_lineups (fixture_id, team_id, formation, startXI, substitutes, coach)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            fixtureId,
            side.team.id,
            side.formation,
            JSON.stringify(side.startXI),
            JSON.stringify(side.substitutes),
            JSON.stringify(side.coach)
        ]);
    }
    console.log(`   -> Saved lineups.`);
}

async function saveMatchFull(connection, item) {
    const { fixture, league, teams, goals } = item;

    // Save League
    await connection.query(`
        INSERT INTO leagues (id, name, type, country, logo, season)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name), logo=VALUES(logo)
    `, [league.id, league.name, league.type, league.country || 'World', league.logo, league.season || 2025]); // Default to 2025 if missing

    // Save Teams
    await connection.query(`
        INSERT INTO teams (id, name, country, logo, founded)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name), logo=VALUES(logo)
    `, [teams.home.id, teams.home.name, teams.home.country || 'World', teams.home.logo, teams.home.founded]);

    await connection.query(`
        INSERT INTO teams (id, name, country, logo, founded)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name), logo=VALUES(logo)
    `, [teams.away.id, teams.away.name, teams.away.country || 'World', teams.away.logo, teams.away.founded]);

    // Save Fixture
    // Status short/long are crucial for the "banner" color 
    await connection.query(`
        INSERT INTO fixtures (id, league_id, season, date, status_short, status_long, referee, home_team, away_team, goals_home, goals_away, elapsed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status_short=VALUES(status_short), updated_at=NOW()
    `, [
        fixture.id,
        league.id,
        league.season || 2025,
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

async function run() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await getDbConnection();
        console.log('Connected.');

        // 1. Clear Tables
        console.log('Clearing old data (fixtures/events/lineups)...');
        await connection.query('DELETE FROM fixture_lineups');
        await connection.query('DELETE FROM fixture_events');
        await connection.query('DELETE FROM fixtures');
        console.log('Tables cleared.');

        // 2. Fetch England (Premier League - 39) or Spain (La Liga - 140) matches
        console.log('Fetching last 5 matches from Premier League (39) or La Liga (140)...');
        let matchesToSave = [];

        // Try Premier League first (Season 2024 usually has data for late 2024/early 2025)
        // Note: API-Football seasons usually span years (e.g. 2024 = 2024/2025).
        matchesToSave = await fetchFromApi('fixtures', { league: 39, season: 2024, last: 5 });

        if (!matchesToSave || matchesToSave.length === 0) {
            console.log('No EPL matches. Trying La Liga (140)...');
            matchesToSave = await fetchFromApi('fixtures', { league: 140, season: 2024, last: 5 });
        }

        if (matchesToSave.length === 0) {
            console.log('No matches found for EPL or La Liga. Fetching ANY 5 matches for 2024...');
            matchesToSave = await fetchFromApi('fixtures', { season: 2024, last: 5 });
        }

        if (!matchesToSave || matchesToSave.length === 0) {
            console.log('Still no matches found. Exiting.');
            return;
        }

        // 4. Save Matches
        console.log(`Saving ${matchesToSave.length} matches...`);
        for (const item of matchesToSave) {
            console.log(`Saving: ${item.teams.home.name} vs ${item.teams.away.name} (ID: ${item.fixture.id})`);
            await saveMatchFull(connection, item);

            // Fetch detailed events/lineups for these high quality matches
            // This ensures the "Match Room" experience is good for testing
            // Note: fetchAndSaveEvents and fetchAndSaveLineups are not defined in this snippet.
            // They would need to be implemented separately.
            if (typeof fetchAndSaveEvents === 'function') await fetchAndSaveEvents(connection, item.fixture.id);
            if (typeof fetchAndSaveLineups === 'function') await fetchAndSaveLineups(connection, item.fixture.id);
        }
        console.log('✅ Done.');

    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
}

run();
