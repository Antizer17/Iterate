import { GoogleGenAI, Type } from '@google/genai';
import GeneratedModule from "../models/generatedModules.js";

// Initialize the SDK using your screaming snake case environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: {
    timeout: 60000, 
  } });

async function generateContent(course, courseCode, topic, order, bracUNotesContext) {
  console.log(`Coursecode is ${courseCode} and topic is ${topic} and order is ${order}`);
  
  const systemPrompt = `You are a CS professor generating revision modules for BRAC University students preparing for technical interviews.
Generate a revision module for the topic "${topic}" in course "${course}" (${courseCode}).
Use this context but remember it may have noisy mathematical content, only work on the core concepts and it is not required for you to generate the exact same mathematical expressions, its lightweight revision content! Just try to convey the main essential idea.: ${bracUNotesContext}`;

  const userPrompt = `Rules:
- lessonBody must be a single plain string formatted in clean Markdown using standard bullet points (-), bold text (**text**), and line breaks (\\n) for visual structure. It must not contain the name of the topic or course. Do NOT make it an array.
- interviewRelevance must be a single plain string explaining why this topic appears in technical interviews.
- quiz must have EXACTLY 2 questions.
- correctAnswer must be exactly one of: "A", "B", "C", or "D".
- options array must have EXACTLY 4 items.`;

  try {
    // Requesting from Gemini with absolute Schema enforcement
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Fast, highly accurate, perfect for structured JSON generation
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        // Enforce the exact object layout natively via Gemini's schema configuration engine
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lessonBody: { 
              type: Type.STRING, 
              description: "Markdown string with bullet points and line breaks. No arrays." 
            },
            interviewRelevance: { 
              type: Type.STRING 
            },
            quiz: {
              type: Type.ARRAY,
              description: "Array containing exactly 2 quiz questions.",
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.INTEGER },
                  questionBody: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Exactly 4 options formatted like ['A. opt', 'B. opt', ...]"
                  },
                  correctAnswer: { 
                    type: Type.STRING, 
                    enum: ["A", "B", "C", "D"] 
                  },
                  solutionExplanation: { type: Type.STRING }
                },
                required: ["questionNumber", "questionBody", "options", "correctAnswer", "solutionExplanation"]
              }
            }
          },
          required: ["lessonBody", "interviewRelevance", "quiz"]
        }
      }
    });

    // Gemini guarantees valid JSON that matches the schema, so we can parse it cleanly instantly
    const parsed = JSON.parse(response.text);

    // Saving data to MongoDB with a fallback check to resolve the E11000 unique key problem
    try {
      const saved = await GeneratedModule.create({
        courseCode: courseCode, 
        topic: topic,
        lessonBody: parsed.lessonBody,
        interviewRelevance: parsed.interviewRelevance,
        quiz: parsed.quiz,
        approved: false
      });
      return saved;
    } catch (dbError) {
      if (dbError.code === 11000) {
        console.log(`Duplicate entry caught for topic "${topic}". Returning existing record.`);
        // Corrected database query filter to lookup by courseCode instead of the non-passed 'course' variable
        return await GeneratedModule.findOne({ courseCode, topic });
      }
      throw dbError;
    }

  } catch (error) {
    console.error("Error running generation pipeline:", error);
    throw error;
  }
}

export default generateContent;