import express from 'express'
import {getUniqueCourses,getCourseTopics} from '../controllers/materialsControllers.js'
import {requireAuth} from '../middlewares/authMiddleware.js'

const router=express.Router()
console.log("materialRoutes.js loaded");
router.get("/", requireAuth, getUniqueCourses)
router.get("/:courseCode",requireAuth,getCourseTopics)

export default router;