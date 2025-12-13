import apiFootball from '../config/apiFootball.js';
import pool from '../config/db.js';

const AFRICAN_COUNTRIES = [
    'South Africa', 'Nigeria', 'Kenya', 'Egypt', 'Morocco', 'Ghana',
    'Senegal', 'Algeria', 'Cameroon', 'Tunisia', 'Ivory Coast',
    'Congo DR', 'Zambia', 'Zimbabwe', 'Tanzania', 'Uganda'
];

/**
 * Fetch competitions (leagues) from API-Football for African countries and store in DB.
 */
export const fetchCompetitions = async () => {
    try {
        console.log(`Fetching competitions for ${AFRICAN_COUNTRIES.length} African countries...`);
        let totalProcessed = 0;
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            for (const country of AFRICAN_COUNTRIES) {
                console.log(`Fetching leagues for ${country}...`);

                // Fetch leagues for the specific country
                const response = await apiFootball.get('/leagues', {
                    params: { country: country }
                });

                const leaguesData = response.data.response;

                if (!leaguesData || leaguesData.length === 0) {
                    console.log(`No leagues found for ${country}`);
                    continue;
                }

                for (const item of leaguesData) {
                    const { league, country: countryObj, seasons } = item;

                    // Get 'current' season if possible, or just the last one in the array (usually sorted)
                    // Requirements schema handles basic league info. 
                    // Storing the most recent seasonYear as 'season'.
                    const lastSeason = seasons[seasons.length - 1];
                    const seasonYear = lastSeason ? lastSeason.year : null;

                    await connection.query(`
                        INSERT INTO leagues (id, name, type, country, logo, season)
                        VALUES (?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                        name=VALUES(name), type=VALUES(type), country=VALUES(country), 
                        logo=VALUES(logo), season=VALUES(season)
                    `, [
                        league.id,
                        league.name,
                        league.type,
                        countryObj.name,
                        league.logo,
                        seasonYear
                    ]);
                    totalProcessed++;
                }
            }

            await connection.commit();
            console.log(`✅ Competitions updated successfully. Total leagues processed: ${totalProcessed}`);
        } catch (err) {
            await connection.rollback();
            console.error('Error updating competitions:', err);
            throw err;
        } finally {
            connection.release();
        }

        return totalProcessed;

    } catch (error) {
        console.error('Failed to fetch competitions:', error.message);
        throw error;
    }
};
