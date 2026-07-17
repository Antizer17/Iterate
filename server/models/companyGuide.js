
const CompanyGuideSchema = new mongoose.Schema({
  company: { type: String, required: true, unique: true },
  introduction: { type: String, default: "" },
  interviewStages: [{ type: String }], // Array of strings outlining the chronological timeline
  questions: [
    {
      questionText: { type: String, required: true },
      category: { 
        type: String, 
        enum: ["Database", "Operating Systems", "DSA", "System Design", "OOP", "Frontend", "Backend", "HR/Behavioral", "General CS"], 
        default: "General CS" 
      },
      difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
      details: { type: String, default: "" }, 
      solutionCode: { type: String, default: "" } 
    }
  ]
}, { timestamps: true });

const CompanyGuide = mongoose.models.CompanyGuide || mongoose.model("CompanyGuide", CompanyGuideSchema);
export default CompanyGuide;