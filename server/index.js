import express from 'express'
import connectDB from './utils/dbConnect.js'
import userRoute from './Routes/userRoutes.js'
import materialsRouter from './Routes/materialRoutes.js'
import cronSchedular from './utils/cronScheduler.js'
import cors from "cors"
import passport from 'passport';
import cookieParser from 'cookie-parser'; // Essential for reading the JWT cookie later
import './config/auth.js'; // This forces your Passport strategy file to execute and initialize
import authRoutes from './routes/authRoutes.js';

const port =process.env.PORT
const app = express()
connectDB()
app.listen(port || 1700,()=>{
    console.log(`Server is running on port ${port}`)
})
app.use(cors());
cronSchedular()
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoute)
app.use('/api/materials', materialsRouter)


