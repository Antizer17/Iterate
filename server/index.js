import express from 'express'
import connectDB from './utils/dbConnect.js'
import onBoardRouter from './Routes/onBoardingRoutes.js'
import cronSchedular from './utils/cronScheduler.js'

const port =process.env.PORT
const app = express()
connectDB()
app.listen(port || 1700,()=>{
    console.log(`Server is running on port ${port}`)
})
cronSchedular()
app.use(express.json())
app.use('/api/onboard', onBoardRouter)

