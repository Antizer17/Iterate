process.env.CUDA_VISIBLE_DEVICES = "-1";
process.env.OLLAMA_MODIFIERS = "cpu";
import express from 'express'
import connectDB from './utils/dbConnect.js'
import userRoute from './Routes/userRoutes.js'
import materialsRouter from './Routes/materialRoutes.js'
import cronSchedular from './utils/cronScheduler.js'
import cors from "cors"
import passport from 'passport';
import cookieParser from 'cookie-parser'; // Essential for reading the JWT cookie later
import './config/auth.js'; // This forces your Passport strategy file to execute and initialize
import authRoutes from './Routes/authRoutes.js';
import progressRouter from "./Routes/progressRoutes.js"
import { requireAuth } from './middlewares/authMiddleware.js'
import streakRouter from './Routes/streakRoutes.js'
import interviewRoutes from './Routes/interviewRoutes.js'
import cronRoutes from './Routes/cronRoutes.js'

const port =process.env.PORT
const app = express()
connectDB()
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
cronSchedular()
app.set('trust proxy', 1); 
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoute)
app.use("/api/progress", progressRouter)
app.use('/api/materials', materialsRouter)
app.use('/api/streak', streakRouter)
app.use('/api/interview', interviewRoutes)
app.use('/api/cron',cronRoutes)

app.listen(port || 1700,()=>{
    console.log(`Server is running on port 1700`)
})


