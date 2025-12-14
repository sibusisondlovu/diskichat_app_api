import { fetchTeams } from '../src/services/teams.service.js';

const run = async () => {
    try {
        console.log('Starting manual sync of South African teams (MVP)...');
        const teams = await fetchTeams();
        console.log(`Sync complete. Processed ${teams.length} teams.`);
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
};

run();
