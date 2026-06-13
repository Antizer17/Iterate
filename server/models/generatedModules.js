import mongoose from "mongoose";

const generatedModulesSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    maxlength: 6, 
    required: true,
    uppercase: true,
    index: true
  },
  topic: {
    type: String,
    required: true,
    unique: true
  },
  approved: {
    type: Boolean,
    default: false,
    required: true
  },
  lessonBody: {
    type: String,
    required: true
  },
  interviewRelevance: {
    type: String,
    required: true
  },
  
  // Validated 3-Question Array
  quiz: {
    type: [
      {
        questionNumber: {
          type: Number, 
          required: true
        },
        questionBody: {
          type: String,
          required: true
        },
        options: {
          type: [String],
          validate: {
            validator: function (val) {
              return val.length === 4; 
            },
            message: "Each quiz question must have exactly 4 options."
          },
          required: true
        },
        correctAnswer: {
          type: String, 
          required: true,
          uppercase: true, 
          enum: ["A", "B", "C", "D"] 
        },
        solutionExplanation: {
          type: String, 
          required: true
        }
      }
    ],
    validate: {
      validator: function (val) {
        return val.length === 2; // STRICT ENFORCEMENT
      },
      message: "A topic refresher module must contain exactly 2 MCQs."
    },
    required: true
  }
}, { timestamps: true });

const generatedModules = mongoose.model("generatedModules", generatedModulesSchema);
export default generatedModules;