import { fetchLiveMatches } from '../src/services/liveMatches.service.js';

const run = async () => {
    try {
        console.log('Starting manual sync of live matches...');
        const matches = await fetchLiveMatches();
        console.log(`Sync complete. Processed ${matches.length} matches.`);
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
};

run();
