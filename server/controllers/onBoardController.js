import mongoose from "mongoose"
import users from "../models/users.js"
import seedProgressDB from "../utils/seedUserProgress.js"
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

export default register;