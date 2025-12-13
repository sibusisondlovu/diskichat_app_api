import apiFootball from '../config/apiFootball.js';
import pool from '../config/db.js';

/**
 * Fetch teams from API-Football for a specific country and store in DB.
 * Default country is 'South Africa'.
 */
export const fetchTeams = async (country = 'South Africa') => {
    try {
        console.log(`Fetching teams for ${country}...`);

        const response = await apiFootball.get('/teams', {
            params: { country: country }
        });

        const teamsData = response.data.response;

        if (teamsData.length === 0) {
            console.log(`No teams found for ${country}.`);
            return [];
        }

        console.log(`Found ${teamsData.length} teams for ${country}. Updating DB...`);

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            for (const item of teamsData) {
                const { team, venue } = item;

                await connection.query(`
                    INSERT INTO teams (id, name, country, logo, founded, venue_name, venue_city, venue_capacity)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    name=VALUES(name), country=VALUES(country), logo=VALUES(logo), 
                    founded=VALUES(founded), venue_name=VALUES(venue_name), 
                    venue_city=VALUES(venue_city), venue_capacity=VALUES(venue_capacity)
                `, [
                    team.id,
                    team.name,
                    team.country,
                    team.logo,
                    team.founded,
                    venue.name,
                    venue.city,
                    venue.capacity
                ]);
            }

            await connection.commit();
            console.log(`✅ Teams for ${country} updated successfully.`);
        } catch (err) {
            await connection.rollback();
            console.error('Error updating teams:', err);
            throw err;
        } finally {
            connection.release();
        }

        return teamsData;

    } catch (error) {
        console.error('Failed to fetch teams:', error.message);
        throw error;
    }
};
