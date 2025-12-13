import { fetchCompetitions } from '../src/services/competitions.service.js';

const run = async () => {
    try {
        console.log('Starting manual sync of competitions...');
        await fetchCompetitions();
        console.log('Sync complete.');
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
};

run();
