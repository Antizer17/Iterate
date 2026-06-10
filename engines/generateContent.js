import { GoogleGenerativeAI } from "@google/generative-ai";
import GeneratedModule from "../models/generatedModules.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateContent(course, courseCode, topic, order, bracUNotesContext) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 2500,
    }
  });

  const prompt = `You are a CS professor generating revision modules for BRAC University students preparing for technical interviews.

Generate a revision module for the topic "${topic}" in course "${course}" (${courseCode}).
Use this context: ${bracUNotesContext}

Return exactly this JSON structure:
{
  "lessonBody": "a single plain string with bullet points separated by newline characters. NOT an array. Example: '• Point one\\n• Point two\\n• Point three'",
  "interviewRelevance": "a single plain string explaining why this topic appears in technical interviews",
  "quiz": [
    {
      "questionNumber": 1,
      "questionBody": "question text",
      "options": ["A. option", "B. option", "C. option", "D. option"],
      "correctAnswer": "A",
      "solutionExplanation": "why this answer is correct"
    },
    {
      "questionNumber": 2,
      "questionBody": "question text",
      "options": ["A. option", "B. option", "C. option", "D. option"],
      "correctAnswer": "B",
      "solutionExplanation": "why this answer is correct"
    },
    {
      "questionNumber": 3,
      "questionBody": "question text",
      "options": ["A. option", "B. option", "C. option", "D. option"],
      "correctAnswer": "C",
      "solutionExplanation": "why this answer is correct"
    }
  ]
}

Rules:
- lessonBody must be a STRING not an array
- interviewRelevance must be a STRING not an array
- quiz must have EXACTLY 3 questions
- correctAnswer must be exactly one of: "A", "B", "C", or "D"
- options array must have EXACTLY 4 items
- No extra fields, no extra text outside the JSON`;

  const result = await model.generateContent(prompt);
  const parsed = JSON.parse(result.response.text());

  // safety nets
  if (Array.isArray(parsed.lessonBody)) {
    parsed.lessonBody = parsed.lessonBody.join("\n");
  }
  if (Array.isArray(parsed.interviewRelevance)) {
    parsed.interviewRelevance = parsed.interviewRelevance.join("\n");
  }

  const saved = await GeneratedModule.create({
    course: courseCode,
    topic,
    lessonBody: parsed.lessonBody,
    interviewRelevance: parsed.interviewRelevance,
    quiz: parsed.quiz,
    approved: false
  });

  return saved;
}

export default generateContent;