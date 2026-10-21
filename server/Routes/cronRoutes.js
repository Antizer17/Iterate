import express from 'express';
import runTask from '../controllers/cronController.js';
import nudgeServer from '../controllers/cronController.js'
const router = express.Router()
router.post('/invoke',runTask)
router.get('/ping', nudgeServer)
export default router;