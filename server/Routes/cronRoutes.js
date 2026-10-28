import express from 'express';
import { runTask, syncGuidesTask, nudgeServer } from '../controllers/cronController.js';

const router = express.Router();
router.post('/invoke', runTask);
router.post('/sync-guides', syncGuidesTask);
router.get('/ping', nudgeServer);

export default router;