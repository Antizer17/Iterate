import progress from "../models/progress.js"
export default async function getUserProgress(req,res){
try{
     const userID=req.userId
     console.log(`youre user id is : ${userID}`)
     const userProgress = await progress.find({user:userID})
     if(!userProgress || userProgress.length === 0){
        return res.status(404).json({"message":"No progress data found for this user."})
     }
     console.log(userProgress,"SUP MAN :D")
     
     return res.status(200).json({"status":"success",
        "data": userProgress})

}catch(err){
    console.error(`Error fetching user progress:${err}`)
    return res.status(500).json({"status":"error", "message":"error fetching progress data."})
}
}