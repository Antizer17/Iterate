import express from 'express';
import runTask from '../controllers/cronController.js';
const router = express.Router()
router.post('/invoke',runTask)
export default router;