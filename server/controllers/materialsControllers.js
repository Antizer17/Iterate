import materials from "../models/materials.js"
import mongoose from "mongoose"

export default async function getTopics(req,res){
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
    }catch(err){
        console.error(err)
    }
}
