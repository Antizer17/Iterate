import ollama from 'ollama';
import GeneratedModule from "../models/generatedModules.js";

async function generateContent(course, courseCode, topic, order, bracUNotesContext) {
  console.log(`Coursecode is ${courseCode} and topic is ${topic} and order is ${order}`)
  
  const systemPrompt = `You are a CS professor generating revision modules for BRAC University students preparing for technical interviews.
Generate a revision module for the topic "${topic}" in course "${course}" (${courseCode}).
Use this context but remember it may have noisy mathmatical content, only work on the core concepts and it is not required for you to generate the exact same mathmatical expressions, its lightweight revision content!: ${bracUNotesContext}

Return exactly this JSON structure:
{
  "lessonBody": "A single plain string formatted in clean Markdown. Use standard Markdown bullet points (-), bold text (**text**), and line breaks (\\n) for visual structure. Do NOT return an array.",
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
    
  ]
}`;

  const userPrompt = `Rules:
- lessonBody must be a STRING not an array and it must not contain name of the topic or course.
- interviewRelevance must be a STRING not an array
- quiz must have EXACTLY 2 questions
- correctAnswer must be exactly one of: "A", "B", "C", or "D"
- options array must have EXACTLY 4 items
- No extra fields, no extra text outside the JSON`;

  // Requesting from Ollama using your local qwen model with enforced JSON format
  const response = await ollama.chat({
    model: 'qwen2.5-coder:7b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    format: 'json'
  });

  let parsed;
  try {
    // Sanitize any accidental markdown blocks Ollama might add before parsing
    const raw = response.message.content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
      
    parsed = JSON.parse(raw);
  } catch (parseError) {
    console.error("Failed parsing Ollama JSON response:", response.message.content);
    throw new Error(`Ollama JSON format error: ${parseError.message}`);
  }

  // Safety nets for array properties
  if (Array.isArray(parsed.lessonBody)) {
    parsed.lessonBody = parsed.lessonBody.join("\n");
  }
  if (Array.isArray(parsed.interviewRelevance)) {
    parsed.interviewRelevance = parsed.interviewRelevance.join("\n");
  }

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
      return await GeneratedModule.findOne({ course, topic });
    }
    throw dbError;
  }
}

export default generateContent;
