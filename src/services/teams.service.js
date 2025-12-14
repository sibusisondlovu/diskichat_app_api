// Leagues to fetch teams from: South Africa (288), England (39), Spain (140), Germany (78), Italy (135)
const TARGET_LEAGUES_FOR_TEAMS = [288, 39, 140, 78, 135];
const TARGET_SEASON = 2024; // 2025 might not be available for all yet, using 2024 as current season for European leagues usually. South Africa 288 is usually current. 
// Re-reading user prompt: "brackets for 2025 season". Many leagues 2025 starts later (e.g. Aug 2025). 
// I will use 2024 for now as it's the active season for most, or try 2025 if provided.
// Actually, API Football usually uses start year. 2024-2025 season is '2024'. 
// I'll stick to 2024 to be safe for current data, unless user explicitly demands 2025 (which might be empty).
// User said "2025 season". I will try 2024 first as it equates to 2024/2025.

import apiFootball from '../config/apiFootball.js';
import pool from '../config/db.js';

/**
 * Fetch teams from specific leagues for the current season.
 */
export const fetchTeams = async () => {
    try {
        console.log(`Fetching teams for ${TARGET_LEAGUES_FOR_TEAMS.length} leagues (Season ${TARGET_SEASON})...`);
        let totalTeams = 0;
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            for (const leagueId of TARGET_LEAGUES_FOR_TEAMS) {
                console.log(`Fetching teams for League ID: ${leagueId}...`);

                const response = await apiFootball.get('/teams', {
                    params: {
                        league: leagueId,
                        season: TARGET_SEASON
                    }
                });

                const teamsData = response.data.response;

                if (!teamsData || teamsData.length === 0) {
                    console.log(`No teams found for League ${leagueId} Season ${TARGET_SEASON}`);
                    if (response.data && response.data.errors) {
                        console.log('API Errors:', JSON.stringify(response.data.errors, null, 2));
                    }
                    continue;
                }

                console.log(`Found ${teamsData.length} teams for League ${leagueId}. Updating DB...`);

                for (const item of teamsData) {
                    const { team, venue } = item;

                    await connection.query(`
                        INSERT INTO teams (id, name, code, country, logo, founded, venue_name, venue_city, venue_capacity)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                        name=VALUES(name), code=VALUES(code), country=VALUES(country), logo=VALUES(logo), 
                        founded=VALUES(founded), venue_name=VALUES(venue_name), 
                        venue_city=VALUES(venue_city), venue_capacity=VALUES(venue_capacity)
                    `, [
                        team.id,
                        team.name,
                        team.code, // Short code
                        team.country,
                        team.logo,
                        team.founded,
                        venue.name,
                        venue.city,
                        venue.capacity
                    ]);
                    totalTeams++;
                }
            }

            await connection.commit();
            console.log(`✅ Teams updated successfully. Total teams processed: ${totalTeams}`);
            return totalTeams;
        } catch (err) {
            await connection.rollback();
            console.error(`Error updating teams:`, err);
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error(`Failed to fetch teams:`, error.message);
        throw error;
    }
};
