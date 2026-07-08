import express from 'express';
import syncStreak from '../controllers/streakController.js';
import syncConfusion from '../controllers/confusedController.js'

const router = express.Router();
router.get("/sync", syncStreak);
router.get("/confused", syncConfusion)

export default router;
