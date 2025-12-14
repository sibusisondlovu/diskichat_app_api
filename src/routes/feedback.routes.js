import express from 'express';
import { submitFeedback } from '../controllers/feedback.controller.js';

const router = express.Router();

router.post('/feedback', submitFeedback);

export default router;
