import express from 'express';
import syncStreak from '../controllers/streakController.js';
import {syncConfusion,getConfusedTopics} from '../controllers/confusedController.js'
import { requireAuth } from '../middlewares/authMiddleware.js';


const router = express.Router();
router.get("/sync", requireAuth,syncStreak);
router.get("/confused", requireAuth,syncConfusion)
router.get("/getConfusedTopics",requireAuth, getConfusedTopics)
// router.get("/getResources", getResources)

export default router;
