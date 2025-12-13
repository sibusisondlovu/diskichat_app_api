import pool from '../src/config/db.js';

const createTables = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to database. Creating tables...');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS leagues (
                id INT PRIMARY KEY,
                name VARCHAR(255),
                type VARCHAR(50),
                country VARCHAR(255),
                logo VARCHAR(500),
                season INT
            )
        `);
        console.log('✅ Table "leagues" created or exists.');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS teams (
                id INT PRIMARY KEY,
                name VARCHAR(255),
                country VARCHAR(255),
                logo VARCHAR(500),
                founded INT,
                venue_name VARCHAR(255),
                venue_city VARCHAR(255),
                venue_capacity INT
            )
        `);
        console.log('✅ Table "teams" created or exists.');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS fixtures (
                id INT PRIMARY KEY,
                league_id INT,
                season INT,
                date DATETIME,
                status_short VARCHAR(10),
                status_long VARCHAR(100),
                referee VARCHAR(255),
                home_team INT,
                away_team INT,
                goals_home INT,
                goals_away INT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (league_id) REFERENCES leagues(id),
                FOREIGN KEY (home_team) REFERENCES teams(id),
                FOREIGN KEY (away_team) REFERENCES teams(id)
            )
        `);
        console.log('✅ Table "fixtures" created or exists.');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS fixture_events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fixture_id INT,
                team_id INT,
                player VARCHAR(255),
                type VARCHAR(50),
                detail VARCHAR(255),
                minutes INT,
                extra VARCHAR(255),
                FOREIGN KEY (fixture_id) REFERENCES fixtures(id),
                FOREIGN KEY (team_id) REFERENCES teams(id)
            )
        `);
        console.log('✅ Table "fixture_events" created or exists.');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS fixture_lineups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fixture_id INT,
                team_id INT,
                formation VARCHAR(50),
                startXI JSON,
                substitutes JSON,
                coach JSON,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (fixture_id) REFERENCES fixtures(id),
                FOREIGN KEY (team_id) REFERENCES teams(id)
            )
        `);
        console.log('✅ Table "fixture_lineups" created or exists.');

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        process.exit(1);
    }
};

createTables();
