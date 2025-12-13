import pool from '../src/config/db.js';

const verify = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('--- Database Verification ---');

        const [leagues] = await connection.query('SELECT COUNT(*) as count FROM leagues');
        console.log(`Leagues: ${leagues[0].count}`);

        const [teams] = await connection.query('SELECT COUNT(*) as count FROM teams');
        console.log(`Teams: ${teams[0].count}`);

        const [fixtures] = await connection.query('SELECT COUNT(*) as count FROM fixtures');
        console.log(`Fixtures: ${fixtures[0].count}`);

        const [events] = await connection.query('SELECT COUNT(*) as count FROM fixture_events');
        console.log(`Events: ${events[0].count}`);

        if (fixtures[0].count > 0) {
            const [rows] = await connection.query('SELECT * FROM fixtures LIMIT 3');
            console.log('\nSample Fixtures:', JSON.stringify(rows, null, 2));
        }

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verify();
