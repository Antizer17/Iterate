import express from 'express';
import syncStreak from '../controllers/streakController.js';
import {syncConfusion,getConfusedTopics, reportContent, getReportedContents} from '../controllers/streakController.js'
import { requireAuth } from '../middlewares/authMiddleware.js';
 
 
const router = express.Router();
router.get("/sync", syncStreak);
router.get("/confused", syncConfusion)
router.get("/getConfusedTopics",requireAuth, getConfusedTopics)
router.get("/report", reportContent)
router.get("/getReportedContents", requireAuth, getReportedContents)
// router.get("/getResources", getResources)
 
export default router;
 