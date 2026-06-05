import mongoose from 'mongoose';

const materialsSchema = new mongoose.Schema({
  course: { type: String, required: true, enum: ['dsa', 'os', 'dbms', 'networks'] },
  courseCode:[{type: String, enums: [CSE111,CSE220,CSE221,CSE370,CSE321,CSE421,CSE470,CSE422,CSE471]}],
  topic: { type: String, required: true },  
  order: { type: Number, required: true },   
  bracUNotesContext: { type: String, required: true } 
});

materialsSchema.index({ course: 1, order: 1 }, { unique: true });

export default mongoose.model('materials', materialsSchema);