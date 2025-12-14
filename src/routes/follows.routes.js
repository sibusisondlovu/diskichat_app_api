import express from 'express';
import {
    getUserFollows,
    followTeam,
    unfollowTeam,
    followLeague,
    unfollowLeague
} from '../controllers/follows.controller.js';

const router = express.Router();

router.get('/:userId', getUserFollows);
router.post('/team', followTeam);
router.post('/team/unfollow', unfollowTeam); // Using POST for simple body payload
router.post('/league', followLeague);
router.post('/league/unfollow', unfollowLeague);

export default router;
