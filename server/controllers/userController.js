import mongoose from "mongoose"
import users from "../models/users.js"
import seedProgressDB from "../utils/seedUserProgress.js"
import progress from "../models/progress.js"

const register = async (req,res)=>{
const {email} = req.body
const exists = await users.findOne({
    email:email
})
if(exists){
    return res.status(401).json({error:"You are already subscribed!"})
}
const nameList=email.split(".")
console.log(nameList)
const name=nameList[0][0].toUpperCase() +nameList[0].slice(1) +" "+nameList[1][0].toUpperCase()+nameList[1].slice(1)
console.log(name)
const userObj={name:name,
    email:email
}

const user = new users(userObj)
try{
    const userData = await user.save()
    await seedProgressDB(userData._id)
    res.status(201).json({status:"Success",data:{user}})
    
}catch(err){
    res.status(500).json({error:{err}})
}
}

const enrollCourse = async (req,res)=>{
    const {userID, course, courseCode, confidenceScore} = req.body
    try{
        const userExists = await users.findOne({
        _id:userID
    })
    if(!userExists){
        return res.status(404).json({error:"User not found"})
    }
    const progressExists = await progress.findOne({
        user:userID,
        courseCode:courseCode
    })
    if(progressExists){
        return res.status(401).json({Error:"Already enrolled in this course."})
    }
    const data = new progress({user:userID,
        course:course,
        courseCode:courseCode,
        confidenceScore:confidenceScore,

    })
    await data.save()
    const updatedUser = await users.findByIdAndUpdate(userID,
        {$addToSet : {enRolledCourses:courseCode}},
        { new: true, runValidators: true }
    )
    res.status(201).json({
        message:"Succesfully enrolled in course!",
        user:updatedUser,
        progress:data
    })

    }catch(error){
        console.error("Something went wrong:", error)
    }
    

}
async function getUser(req,res){
    // const {userID} = req.body
    const userID="6a2d6587c4331dbee5cf9bba"
    try{
        const userExists = await users.findOne({
            _id:userID
        })
        if(!userExists){
           return res.status(404).json({Error:"User Not Found"})
        }
           return res.status(200).json({message:"Success",
            data:userExists
        })

    }catch(err){
        console.error(err)
    }
} 

export {register,enrollCourse,getUser};