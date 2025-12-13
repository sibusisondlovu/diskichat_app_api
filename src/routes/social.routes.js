import express from 'express';
import { getFeed, createPost, likePost, addComment } from '../controllers/social.controller.js';

const router = express.Router();

router.get('/feed', getFeed);
router.post('/posts', createPost);
router.post('/posts/:id/like', likePost);
router.post('/posts/:id/comment', addComment);

export default router;
