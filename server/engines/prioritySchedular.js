import progress from "../models/progress.js";
import connectDB from "../utils/dbConnect.js";
import mongoose from "mongoose"

async function calculatePriority(user){
try{
    await connectDB()
    console.log(user)
    const userProgress = await progress.find({user: user._id})
    console.log(userProgress)
    const now= new Date()
    let minPriority=[100,null,null]
    for(let p of userProgress){
        const score=p.confidenceScore/((now-p.lastServedAt)/(1000*60*60))
        if(score<minPriority[0] || minPriority[0]===100){
            minPriority=[score,p.courseCode,p.currentOrderStep]
        }
    }
    return minPriority
    
}catch(err){
    console.error(`Error calculating priority for user ${user}: ${err}`)
}
}
export default calculatePriority;