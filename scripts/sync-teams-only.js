import { fetchTeams } from '../src/services/teams.service.js';
import pool from '../src/config/db.js';

const runTeamsSync = async () => {
    try {
        console.log('🚀 Starting Teams Sync Only...');
        await fetchTeams();
        console.log('\n✅ Teams Sync Completed Successfully.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Teams Sync Failed:', error);
        process.exit(1);
    }
};

runTeamsSync();
