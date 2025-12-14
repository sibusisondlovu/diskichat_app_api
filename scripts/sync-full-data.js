import { fetchCompetitions } from '../src/services/competitions.service.js';
import { fetchTeams } from '../src/services/teams.service.js';
import pool from '../src/config/db.js';

const runFullSync = async () => {
    try {
        console.log('🚀 Starting Full Data Seeding...');

        // 1. Sync Competitions
        console.log('\n--- Syncing Competitions ---');
        await fetchCompetitions();

        // 2. Sync Teams
        console.log('\n--- Syncing Teams ---');
        // Note: fetchTeams now fetches for specific leagues defined in the service
        await fetchTeams();

        console.log('\n✅ Full Data Seeding Completed Successfully.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Data Seeding Failed:', error);
        process.exit(1);
    }
};

runFullSync();
