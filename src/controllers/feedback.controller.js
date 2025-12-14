import pool from '../config/db.js';

export const submitFeedback = async (req, res) => {
    const { userId, type, description } = req.body;

    if (!type || !description) {
        return res.status(400).json({ message: 'Type and description are required' });
    }

    const validTypes = ['feature', 'bug', 'suggestion'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Invalid feedback type' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO feedback (user_id, type, description) VALUES (?, ?, ?)',
            [userId || null, type, description]
        );

        res.status(201).json({
            message: 'Feedback submitted successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Failed to submit feedback' });
    }
};
