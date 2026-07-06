import express from 'express';
import syncStreak from '../controllers/streakController.js';

const router = express.Router();
router.get("/sync", syncStreak);

export default router;
