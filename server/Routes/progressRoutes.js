import express from 'express'
import getUserProgress from '../controllers/progressController.js'

const router = express.Router()
router.get("/user", getUserProgress)
export default router;