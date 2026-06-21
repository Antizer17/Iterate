import express from 'express'
import connectDB from './utils/dbConnect.js'
import userRoute from './Routes/userRoutes.js'
import materialsRouter from './Routes/materialRoutes.js'
import cronSchedular from './utils/cronScheduler.js'
import cors from "cors"

const port =process.env.PORT
const app = express()
connectDB()
app.listen(port || 1700,()=>{
    console.log(`Server is running on port ${port}`)
})
app.use(cors());
cronSchedular()
app.use(express.json())
app.use('/api/users', userRoute)
app.use('/api/materials', materialsRouter)


