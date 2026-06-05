import mongoose from "mongoose"
import users from "./users.js"
import content from "./materials.js"


const progressSchema = new mongoose.Schema({
user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
course: { type: String, required: true, enum: ['Object Oriented Programming', 'Data Structures','Algorithms', 'Database Management Systems', 'Computer Networks','Operating Systems','Artificial Intelligence'] },
courseCode: { type: String, required: true, enum: [CSE111,CSE220,CSE221,CSE370,CSE321,CSE421,CSE470,CSE422,CSE471] },
currentOrderStep: { type: Number, default: 1 }, 
lastServedAt: { type: Date, default: Date.now }, 
confusedVault: [{ type: mongoose.Schema.Types.ObjectId, ref: 'generatedModules' }] 
});

progressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('progress', progressSchema);
const progress = mongoose.model("user-progress",userProgressSchema)
export default progress;