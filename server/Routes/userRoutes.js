import express from "express"
import {register,enrollCourse,getUser} from "../controllers/userController.js"
import { requireAuth } from "../middlewares/authMiddleware.js"


const router = express.Router()
router.get('/',requireAuth ,getUser)
router.post('/subscribe',register)
router.put('/enroll',requireAuth,enrollCourse)

export default router;