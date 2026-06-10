import express from 'express'
import connectDB from './utils/dbConnect.js'
import onBoardRouter from './Routes/onBoardingRoutes.js'
import cronSchedular from './utils/cronScheduler.js'
import users from './models/users.js'
import calculatePriority from './engines/prioritySchedular.js'
import progress from './models/progress.js'
import mongoose from 'mongoose'


const port =process.env.PORT
const app = express()
connectDB()
app.listen(port || 1700,()=>{
    console.log(`Server is running on port ${port}`)
})
// cronSchedular()
app.use(express.json())
app.use('/api/onboard', onBoardRouter)
async function runPriorityScheduler(){
const allUsers=await users.find({})
for(let user of allUsers){
    console.log(`Calculating priority for user ${user._id}...`)
    const progress1= new progress({
        user: user._id,
        course: "Algorithms",
        courseCode: "CSE221",
        confidenceScore: 5,
    })
    await progress1.save()
    const progress2= new progress({
        user: user._id,
        course: "Artificial Intelligence",
        courseCode: "CSE422",
        confidenceScore: 1,
    })
    await progress2.save()
    const weakestCourse= await calculatePriority(user)
    console.log(`Weakest course for user ${user.name}: ${weakestCourse}`)
}}

runPriorityScheduler()
