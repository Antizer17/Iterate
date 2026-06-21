import express from "express"
import {register,enrollCourse,getUser} from "../controllers/userController.js"


const router = express.Router()
router.get('/',getUser)
router.post('/subscribe',register)
router.put('/enroll',enrollCourse)

export default router;