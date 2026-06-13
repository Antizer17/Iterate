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
    console.log(isMaterial.topic)
    const isGenerated= await generatedModules.findOne({
        courseCode: isMaterial.courseCode,
        topic: isMaterial.topic,})
    if(!isGenerated){
        console.log('Cache miss: Generating content for', isMaterial.topic)
       const response= await generateContent(isMaterial.course,isMaterial.courseCode,isMaterial.topic,isMaterial.order,isMaterial.bracUNotesContext)
       return response
    }
    console.log('Cache hit: Returning existing content for', isMaterial.topic)
    return isGenerated

    
}catch(err){
    console.error(`Error fetching generated module for course ${courseCode} step ${currentStep}: ${err}`)
}
}
export default fetchGenerate;
