import pool from "../config/db.js";

/**
 * GET /api/feed
 * Get latest posts
 */
export const getFeed = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(`
            SELECT * FROM posts 
            ORDER BY created_at DESC 
            LIMIT 50
        `);
        connection.release();

        // Check if current user liked each post (Optional, requires req.query.userId)
        // For simple MVP we return raw count. Enhancements: return 'is_liked'.

        res.json(rows);
    } catch (err) {
        console.error("Error fetching feed:", err);
        res.status(500).json({ error: "Failed to fetch feed" });
    }
};

/**
 * POST /api/posts
 * Create new post
 */
export const createPost = async (req, res) => {
    const { userId, username, userAvatar, content, imageUrl, videoUrl } = req.body;

    if (!userId || !content) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(`
            INSERT INTO posts (user_id, username, user_avatar, content, image_url, video_url)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, username, userAvatar, content, imageUrl, videoUrl]);

        const newPostId = result.insertId;
        const [newPost] = await connection.query('SELECT * FROM posts WHERE id = ?', [newPostId]);

        connection.release();
        res.status(201).json(newPost[0]);
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ error: "Failed to create post" });
    }
};

/**
 * POST /api/posts/:id/like
 * Toggle like
 */
export const likePost = async (req, res) => {
    const postId = req.params.id;
    const { userId } = req.body; // or req.user.uid match

    try {
        const connection = await pool.getConnection();

        // Check if already liked
        const [exists] = await connection.query('SELECT id FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);

        if (exists.length > 0) {
            // Unlike
            await connection.query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
            await connection.query('UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?', [postId]);
            res.json({ liked: false });
        } else {
            // Like
            await connection.query('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);
            await connection.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [postId]);
            res.json({ liked: true });
        }

        connection.release();
    } catch (err) {
        console.error("Error toggling like:", err);
        res.status(500).json({ error: "Failed to like post" });
    }
};

/**
 * POST /api/posts/:id/comment
 * Add comment
 */
export const addComment = async (req, res) => {
    const postId = req.params.id;
    const { userId, username, userAvatar, content } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query(`
            INSERT INTO comments (post_id, user_id, username, user_avatar, content)
            VALUES (?, ?, ?, ?, ?)
        `, [postId, userId, username, userAvatar, content]);

        await connection.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?', [postId]);

        connection.release();
        res.json({ success: true });
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ error: "Failed to add comment" });
    }
};
