import express from 'express'
import getTopics from '../controllers/materialsControllers.js'

const router=express.Router()
router.get("/", getTopics)

export default router