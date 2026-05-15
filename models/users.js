import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,   
    },
    name:{
        type: String,
    }
})
const users = mongoose.model("User", userSchema)
export default users;