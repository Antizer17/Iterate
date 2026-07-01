import materials from "../models/materials.js"
import mongoose from "mongoose"

async function getUniqueCourses(req,res){
    try{
        console.log('Controller hit!')
        const allTopics= await materials.aggregate([{$group:{
            _id:{
                course:"$course",
                courseCode:"$courseCode"
            }}
    },{
                $project:{
                    _id:0,
                    course:"$_id.course",
                    courseCode:"$_id.courseCode"
                }
            }
])
        console.log(allTopics.length,allTopics)
        res.json({status:"200",data:{allTopics}})
    }catch(err){
        console.error(err)
        res.status(500).json({status:"error",message:"Error fetching unique courses."})
    }
}

async function getCourseTopics(req,res){
    console.log(`Controller hit for course topics!`,req.params )
    try{
        const {courseCode}=req.params
        console.log(`Course code received: ${courseCode}`)
        const courseTopics= await materials.find({courseCode:courseCode})
          .sort({order:1})
          .lean();
        
        res.json({status:"200",data:{courseTopics}})
        

    }catch(err){
        console.error(err)
        res.status(500).json({status:"error",message:"Error fetching course topics."})
    }
}

export {getUniqueCourses,getCourseTopics};