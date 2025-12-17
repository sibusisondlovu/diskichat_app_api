import express from 'express';
import { getFeed, createPost, likePost, addComment, getComments } from '../controllers/social.controller.js';

const router = express.Router();

router.get('/feed', getFeed);
router.post('/posts', createPost);
router.post('/posts/:id/like', likePost);
router.post('/posts/:id/comment', addComment);
router.get('/posts/:id/comments', getComments);

export default router;
