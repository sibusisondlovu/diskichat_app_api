import apiFootball from '../src/config/apiFootball.js';
import dotenv from 'dotenv';
dotenv.config();

const testLeague = 39; // Premier League
const seasons = [2023, 2024, 2025];

const runDebug = async () => {
    for (const season of seasons) {
        try {
            console.log(`Checking Season ${season}...`);
            const response = await apiFootball.get('/teams', {
                params: {
                    league: testLeague,
                    season: season
                }
            });
            console.log(`Season ${season}: Found ${response.data.response.length} teams.`);
            if (response.data.errors && Object.keys(response.data.errors).length > 0) {
                console.log('Errors:', response.data.errors);
            }
        } catch (error) {
            console.error(`Season ${season} Error:`, error.message);
        }
    }
};

runDebug();
