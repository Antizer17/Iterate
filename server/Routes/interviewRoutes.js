import express from 'express'
import { requireAuth } from '../middlewares/authMiddleware.js';
import getCompanies from '../controllers/interviewController.js';

const router = express.Router()
console.log("ROuter hit!")
router.get("/companies", getCompanies)
export default router;