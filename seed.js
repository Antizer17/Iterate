import { GoogleGenerativeAI } from "@google/generative-ai"
import mongoose from "mongoose"
import content from "./models/materials.js"


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-3-flash-preview",
  generationConfig: { responseMimeType: "application/json" } // Forces JSON output
});


const topicsToSeed = [

  { course: "CSE111", topic: "Encapsulation: Data Hiding & Access Modifiers" },
  { course: "CSE111", topic: "Abstraction: Abstract Classes vs Interfaces" },
  { course: "CSE111", topic: "Inheritance: The 'Is-A' Relationship & Method Overriding" },
  { course: "CSE111", topic: "Polymorphism: Static (Overloading) vs Dynamic (Overriding)" },

  { course: "CSE111", topic: "Composition vs Inheritance: Why 'Has-A' is often better than 'Is-A'" },
  { course: "CSE111", topic: "The Diamond Problem in Multiple Inheritance" },
  { course: "CSE111", topic: "Constructors: Default, Parameterized, and Copy Constructors" },
  { course: "CSE111", topic: "Static vs Instance Members: Memory Management perspective" },

  { course: "CSE111", topic: "The 'Private' Keyword: Why we hide data from the world" },
  { course: "CSE111", topic: "The 'Public' Interface: Designing the class's lobby" },
  { course: "CSE221", topic: "Protected vs Private: When to let children see the secrets" },
];


async function generateAndSeed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    for (const item of topicsToSeed) {
      console.log(`Generating content for: ${item.topic}...`);

      const prompt = `
  You are a Senior CS Lecturer and Technical Interviewer. Generate a comprehensive interview revision module for the topic "${item.topic}" within the course "${item.course}".

  Return your response strictly as a single, valid JSON object following this exact format:
  {
    "course": "${item.course}",
    "topic": "${item.topic}",
    "interviewRelevance": "Provide a high-impact, 2-3 sentence explanation of why this specific topic is a favorite for technical recruiters and software engineering interviews.",
    "lessonBody": "Provide a concise, dense, high-yield summary of the core concepts in HTML format. Use tags like <b>, <ul>, and <li> to highlight key terminology. Keep it professional and focused on absolute fundamentals.",
    "quiz": [
      {
        "questionNumber": 1,
        "questionBody": "An introductory, definition-based multiple-choice question testing the absolute basics (Easy).",
        "options": [
          "A. First option text",
          "B. Second option text",
          "C. Third option text",
          "D. Fourth option text"
        ],
        "correctAnswer": "The single correct upper-case letter: A, B, C, or D",
        "solutionExplanation": "A detailed explanation of why this choice is correct and why the other options are technically incorrect in this context."
      },
      {
        "questionNumber": 2,
        "questionBody": "A moderate difficulty question testing core differences, structural relationships, runtime behavior, or classic exam patterns (Moderate).",
        "options": [
          "A. First option text",
          "B. Second option text",
          "C. Third option text",
          "D. Fourth option text"
        ],
        "correctAnswer": "The single correct upper-case letter: A, B, C, or D",
        "solutionExplanation": "A detailed explanation of why this choice is correct."
      },
      {
        "questionNumber": 3,
        "questionBody": "An advanced scenario-based question analyzing a hypothetical engineering problem, edge case, or system failure mode related to this topic (Hard).",
        "options": [
          "A. First option text",
          "B. Second option text",
          "C. Third option text",
          "D. Fourth option text"
        ],
        "correctAnswer": "The single correct upper-case letter: A, B, C, or D",
        "solutionExplanation": "A detailed explanation of why this choice is correct and how to avoid the common trap."
      }
    ]
  }

  CRITICAL CONSTRAINTS:
  - Do not include markdown formatting wraps like \`\`\`json or \`\`\`. Output raw string text that can be parsed directly with JSON.parse().
  - Ensure every array under "options" contains exactly 4 elements, explicitly prefixed with "A.", "B.", "C.", and "D.".
  - The "correctAnswer" field must contain exactly one character from the set ["A", "B", "C", "D"].
`;

      const result = await model.generateContent(prompt);
      const contentData = JSON.parse(result.response.text());

      // Save to MongoDB
      await content.create(contentData);
      console.log(`Successfully seeded: ${item.topic}`);
    }

    console.log("All topics seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

generateAndSeed();

