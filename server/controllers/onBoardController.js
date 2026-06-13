import mongoose from "mongoose"
import users from "../models/users.js"
import seedProgressDB from "../utils/seedUserProgress.js"
const register = async (req,res)=>{
const {name,email} = req.body
const exists = await users.findOne({
    email:email
})
if(exists){
    return res.status(401).json({error:"You are already subscribed!"})
}
const user = new users(req.body)
try{
    const userData = await user.save()
    await seedProgressDB(userData._id)
    res.status(201).json({status:"Success",data:{user}})
    
}catch(err){
    res.status(500).json({error:{err}})
}
}

export default register;