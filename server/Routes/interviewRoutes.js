import express from 'express'
import { requireAuth } from '../middlewares/authMiddleware.js';
import {getCompanies,getCompany} from '../controllers/interviewController.js';

const router = express.Router()
console.log("ROuter hit!")
router.get("/companies", getCompanies)
router.get("/:company",getCompany)
export default router;