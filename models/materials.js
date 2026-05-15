import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
course:{
    type: String,
    maxlength: 6,
    required: true
},
topic:{
    type:String,
    required:true
},
approved:{
    type: Boolean,
    default: false,
    required:true
},
lessonBody: {
    type: String,
    required:true
},
interviewRelevance:{
type: String
},
quiz:{
    question:{
        type: String,
        required:true
    },
    answer:{
        type: String,
        required:true
    }
}
})
const content = mongoose.model("revision-Content",contentSchema)
export default content;