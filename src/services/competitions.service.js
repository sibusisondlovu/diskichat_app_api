import apiFootball from '../config/apiFootball.js';
import pool from '../config/db.js';

const TARGET_LEAGUE_IDS = [288, 509, 507, 508, 39, 140, 78, 135, 2, 12, 6, 1];

/**
 * Fetch specific competitions (leagues) from API-Football and store in DB.
 */
export const fetchCompetitions = async () => {
    try {
        console.log(`Fetching ${TARGET_LEAGUE_IDS.length} specific competitions...`);
        let totalProcessed = 0;
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Clear existing leagues to ensure clean slate (optional, but good for seeding)
            // await connection.query('DELETE FROM leagues'); 

            for (const leagueId of TARGET_LEAGUE_IDS) {
                console.log(`Fetching league ID: ${leagueId}...`);

                // Fetch specific league by ID
                const response = await apiFootball.get('/leagues', {
                    params: { id: leagueId }
                });

                const leaguesData = response.data.response;

                if (!leaguesData || leaguesData.length === 0) {
                    console.log(`No data found for League ID ${leagueId}`);
                    continue;
                }

                // Should be only one result for ID
                const item = leaguesData[0];
                const { league, country: countryObj, seasons } = item;

                // Get 'current' season if possible, or just the last one in the array (usually sorted)
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
