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
        You are a Senior CS Lecturer. Generate a revision module for the topic "${item.topic}" in the course "${item.course}".
        Return the response in the following JSON format:
        {
          "course": "${item.course}",
          "topic": "${item.topic}",
          "interviewRelevance": "Explain why this is crucial for software engineering interviews.",
          "lessonBody": "Provide a concise explanation in HTML format. Use <b>, <ul>, <li> tags. Keep it offline-friendly.",
          "quiz": {
            "question": "A specific multiple choice or logic question.",
            "answer": "The detailed explanation of the answer."
          },
          
        }
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