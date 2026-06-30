import express from 'express'
import getUserProgress from '../controllers/progressController.js'
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router()
router.get("/user",requireAuth, getUserProgress)
export default router;