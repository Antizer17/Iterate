import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,   
    },
    name:{
        type: String,
    },
    googleID:{
        type:String,
        unique:true,
        sparse: true
    },
    enRolledCourses:[{type: String, enum: ['CSE111','CSE220','CSE221','CSE370','CSE321','CSE421','CSE470','CSE422','CSE471']}],
    streak:{
        currentStreak:{type:Number,default:0},
        longestStreak:{type:Number,default:0},
        lastSubmitted:{type:String,default:null}
    },
    isActive:{
        type: Boolean,
        default: true
    },
    confusedVault: [{ moduleId:{type: mongoose.Schema.Types.ObjectId, ref: 'generatedModules'},
                      addedAt:{type:Date, default:Date.now}, 
                      resources: [
  {
    title: String,
    url: String
  }
]
                    }] ,
})
const users = mongoose.model("User", userSchema)
export default users;