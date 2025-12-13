import pool from '../src/config/db.js';

const migrateSocial = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('🔄 Migrating DB to add Social Feed tables...');

        try {
            await connection.beginTransaction();

            // 1. Posts Table
            await connection.query(`
                CREATE TABLE IF NOT EXISTS posts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    username VARCHAR(255),
                    user_avatar TEXT,
                    content TEXT,
                    image_url TEXT,
                    video_url TEXT,
                    likes_count INT DEFAULT 0,
                    comments_count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Table "posts" checked/created.');

            // 2. Likes Table
            await connection.query(`
                CREATE TABLE IF NOT EXISTS likes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    post_id INT NOT NULL,
                    user_id VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_like (post_id, user_id),
                    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ Table "likes" checked/created.');

            // 3. Comments Table
            await connection.query(`
                CREATE TABLE IF NOT EXISTS comments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    post_id INT NOT NULL,
                    user_id VARCHAR(255) NOT NULL,
                    username VARCHAR(255),
                    user_avatar TEXT,
                    content TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ Table "comments" checked/created.');

            await connection.commit();
            console.log('🎉 Social migration completed successfully.');

        } catch (err) {
            await connection.rollback();
            throw err;
        }

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateSocial();
