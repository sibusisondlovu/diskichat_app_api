import pool from '../config/db.js';

// Get user's followed items and subscription status
export const getUserFollows = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    try {
        // Get Subscription Type
        const [subRows] = await pool.query('SELECT type FROM user_subscriptions WHERE user_id = ?', [userId]);
        const subscriptionType = subRows.length > 0 ? subRows[0].type : 'FREE';

        // Get Followed Teams
        const [teamRows] = await pool.query(`
            SELECT t.* FROM teams t
            JOIN user_follows_teams uft ON t.id = uft.team_id
            WHERE uft.user_id = ?
        `, [userId]);

        // Get Followed Leagues
        const [leagueRows] = await pool.query(`
            SELECT l.* FROM leagues l
            JOIN user_follows_leagues ufl ON l.id = ufl.league_id
            WHERE ufl.user_id = ?
        `, [userId]);

        res.json({
            success: true,
            data: {
                subscription: subscriptionType,
                teams: teamRows,
                leagues: leagueRows
            }
        });
    } catch (error) {
        console.error('Error fetching user follows:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Follow a Team
export const followTeam = async (req, res) => {
    const { userId, teamId } = req.body;

    if (!userId || !teamId) {
        return res.status(400).json({ success: false, message: 'User ID and Team ID are required' });
    }

    try {
        const connection = await pool.getConnection();

        // Check Limits
        const [subRows] = await connection.query('SELECT type FROM user_subscriptions WHERE user_id = ?', [userId]);
        const subscriptionType = subRows.length > 0 ? subRows[0].type : 'FREE';

        const [countRows] = await connection.query('SELECT COUNT(*) as count FROM user_follows_teams WHERE user_id = ?', [userId]);
        const currentCount = countRows[0].count;

        // Limit Logic: FREE = 1, PRO = 10 (arbitrary high number for now)
        const limit = subscriptionType === 'PRO' ? 10 : 1;

        if (currentCount >= limit) {
            connection.release();
            return res.status(403).json({
                success: false,
                message: `Limit reached. You can only follow ${limit} team(s) on the ${subscriptionType} plan.`
            });
        }

        // Insert
        await connection.query('INSERT IGNORE INTO user_follows_teams (user_id, team_id) VALUES (?, ?)', [userId, teamId]);

        connection.release();
        res.status(201).json({ success: true, message: 'Team followed successfully' });
    } catch (error) {
        console.error('Error following team:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Unfollow a Team
export const unfollowTeam = async (req, res) => {
    const { userId, teamId } = req.body;

    try {
        await pool.query('DELETE FROM user_follows_teams WHERE user_id = ? AND team_id = ?', [userId, teamId]);
        res.json({ success: true, message: 'Team unfollowed successfully' });
    } catch (error) {
        console.error('Error unfollowing team:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Follow a League
export const followLeague = async (req, res) => {
    const { userId, leagueId } = req.body;

    if (!userId || !leagueId) {
        return res.status(400).json({ success: false, message: 'User ID and League ID are required' });
    }

    try {
        const connection = await pool.getConnection();

        // Check Limits
        const [subRows] = await connection.query('SELECT type FROM user_subscriptions WHERE user_id = ?', [userId]);
        const subscriptionType = subRows.length > 0 ? subRows[0].type : 'FREE';

        const [countRows] = await connection.query('SELECT COUNT(*) as count FROM user_follows_leagues WHERE user_id = ?', [userId]);
        const currentCount = countRows[0].count;

        const limit = subscriptionType === 'PRO' ? 10 : 1;

        if (currentCount >= limit) {
            connection.release();
            return res.status(403).json({
                success: false,
                message: `Limit reached. You can only follow ${limit} league(s) on the ${subscriptionType} plan.`
            });
        }

        // Insert
        await connection.query('INSERT IGNORE INTO user_follows_leagues (user_id, league_id) VALUES (?, ?)', [userId, leagueId]);

        connection.release();
        res.status(201).json({ success: true, message: 'League followed successfully' });
    } catch (error) {
        console.error('Error following league:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Unfollow a League
export const unfollowLeague = async (req, res) => {
    const { userId, leagueId } = req.body;

    try {
        await pool.query('DELETE FROM user_follows_leagues WHERE user_id = ? AND league_id = ?', [userId, leagueId]);
        res.json({ success: true, message: 'League unfollowed successfully' });
    } catch (error) {
        console.error('Error unfollowing league:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
