import express from 'express';
import syncStreak from '../controllers/streakController.js';
import {syncConfusion,getConfusedTopics} from '../controllers/confusedController.js'
import { requireAuth } from '../middlewares/authMiddleware.js';


const router = express.Router();
router.get("/sync", syncStreak);
router.get("/confused", syncConfusion)
router.get("/getConfusedTopics",requireAuth, getConfusedTopics)

export default router;
