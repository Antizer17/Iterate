import materials from "../models/materials.js"
import generatedModules from "../models/generatedModules.js"
import generateContent from "./generateContent.js"
import dbConnect from "../utils/dbConnect.js"
const fetchGenerate = async (courseCode, currentStep) =>{
    try{
        await dbConnect()
    const isMaterial = await materials.findOne({
        courseCode: courseCode,
        order: currentStep
    })
    if(!isMaterial){
        throw new Error("No material found for the given course code and step.")
    }
    const isGenerated= await generatedModules.findOne({
        course: isMaterial.course,
        topic: isMaterial.topic,})
    if(!isGenerated){
       const response= await generateContent(isMaterial.course,isMaterial.courseCode,isMaterial.topic,isMaterial.order,isMaterial.bracUNotesContext)
       return response
    }
    return isGenerated

    
}catch(err){
    console.error(`Error fetching generated module for course ${courseCode} step ${currentStep}: ${err}`)
}
}

const result=await fetchGenerate("CSE221",1)
console.log(result)