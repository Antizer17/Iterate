import mongoose from "mongoose"
import users from "./users.js"
import content from "./materials.js"



const progressSchema = new mongoose.Schema({
user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
course: { type: String, required: true, enum: ['Object Oriented Programming', 'Data Structures','Algorithms', 'Database Management Systems', 'Computer Networks','Operating Systems','Artificial Intelligence'] },
courseCode: { type: String, required: true, enum: ['CSE111','CSE220','CSE221','CSE370','CSE321','CSE421','CSE470','CSE422','CSE471'] },
confidenceScore: {type: Number, default: 1, min: 1, max: 10 },
currentOrderStep: { type: Number, default: 1 }, 
lastServedAt: { type: Date, default: Date.now }, 
completedTopics: [{
  order: { type: Number, required: true },
  acedAt: { type: Date, default: Date.now },
  _id: false
}]
});

progressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('progress', progressSchema);
