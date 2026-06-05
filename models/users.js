import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,   
    },
    name:{
        type: String,
    },
    enRolledCourses:[{type: String, enums: [CSE111,CSE220,CSE221,CSE370,CSE321,CSE421,CSE470,CSE422,CSE471]}],
    streak:{
        currentStreak:{type:Number,default:0},
        longestStreak:{type:Number,default:0},
        lastSubmitted:{type:String,default:null}
    },
    isActive:{
        type: Boolean,
        default: true
    },
})
const users = mongoose.model("User", userSchema)
export default users;