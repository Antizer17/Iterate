import mongoose from 'mongoose'
import users from "./users.js"
import materials from './materials.js'


const reportedContents = new mongoose.Schema({
    addedBy: {type: mongoose.Schema.Types.ObjectId, ref:users, required:true},
    material: {type: mongoose.Schema.Types.ObjectId, ref:materials, required:true},
    message: {type: String, maxLength:100 }
})

export default mongoose.model('reported', reportedContents)