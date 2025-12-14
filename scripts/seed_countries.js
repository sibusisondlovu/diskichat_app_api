import pool from '../src/config/db.js';
import apiFootball from '../src/config/apiFootball.js';

// Specific leagues to derive countries from
// 288=SA, 39=England, 140=Spain, 78=Germany, 135=Italy, 2=World(UCL), 12=World(CAF)
const LEAGUE_IDS = [288, 39, 140, 78, 135, 2];

const seedCountries = async () => {
    console.log('🌍 Seeding Countries...');
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Drop table to ensure clean state (schema might be old)
        await connection.query('DROP TABLE IF EXISTS countries');

        // Create table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS countries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                code VARCHAR(10),
                flag VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table "countries" ensured.');

        for (const id of LEAGUE_IDS) {
            try {
                // Fetch league info to get accurate country data
                const response = await apiFootball.get('/leagues', {
                    params: { id: id }
                });

                if (response.data.response.length > 0) {
                    const data = response.data.response[0];
                    const countryName = data.country.name;
                    const countryCode = data.country.code;
                    const countryFlag = data.country.flag;

                    console.log(`Processing ${countryName}...`);

                    // Insert or Update
                    await connection.query(`
                        INSERT INTO countries (name, code, flag, is_active)
                        VALUES (?, ?, ?, TRUE)
                        ON DUPLICATE KEY UPDATE
                        code=VALUES(code), flag=VALUES(flag), is_active=TRUE
                    `, [countryName, countryCode, countryFlag]);
                }
            } catch (apiError) {
                console.error(`Failed to fetch info for league ${id}:`, apiError.message);
            }
        }

        await connection.commit();
        console.log('✅ Countries seeded successfully!');
        process.exit(0);
    } catch (error) {
        await connection.rollback();
        console.error('❌ Failed to seed countries:', error);
        process.exit(1);
    } finally {
        connection.release();
    }
};

seedCountries();
