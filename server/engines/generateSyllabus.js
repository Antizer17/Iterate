import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import ollama from 'ollama';

import Materials from '../models/materials.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cse221Roadmap = [
  // { order: 1, topic: "Introduction to Algorithms",           fileName: "1.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 1,  endPage: 5  },
  // { order: 2, topic: "Running Time & Algorithm Analysis",    fileName: "1.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 6,  endPage: 9  },
  // { order: 3, topic: "Big-O, Omega & Theta Notation",        fileName: "1.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 10, endPage: 35 },
  // 
  // { order: 5, topic: "Binary Search", fileName: "4.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 1, endPage: 9 },
  // { order: 6, topic: "Ternary Search", fileName: "5.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 1, endPage: 7 },
  // { order: 7, topic: "Divide and Conquer Strategy", fileName: "6.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 1, endPage: 51 },
  // { order: 8, topic: "Quick Sort", fileName: "7.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 1, endPage: 11 },
  { order: 9, topic: "Graph Basics", fileName: "8.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 1, endPage: 13 },
{ order: 10, topic: "Paths, Connectivity & Trees", fileName: "8.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 14, endPage: 16 },
{ order: 11, topic: "Graph Representations", fileName: "8.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 17, endPage: 21 },
{ order: 12, topic: "Breadth First Search (BFS)", fileName: "8.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 22, endPage: 28 },
{ order: 13, topic: "Depth First Search (DFS)", fileName: "8.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 29, endPage: 31 },
];

function extractPages(text, startPage, endPage) {
  const pages = text['pages'].filter(obj => obj.num >= startPage && obj.num <= endPage);
  const pageText = pages
  .map(p => `Page ${p.num}\n${p.text}`)
  .join('\n\n');
  console.log(pageText)
  return pageText;
}

const callLocalLLMWithContext = async (rawText, topicName, stepOrder, course, courseCode) => {
  console.log(`🦙 Sending context to local Ollama (qwen2.5-coder:7b)...`);

  const response = await ollama.chat({
    model: 'qwen2.5-coder:7b',
    messages: [
      {
        role: 'system',
        content: `You are a computer science data extraction agent. Extract academic information from university lecture text and return it as a single raw JSON object.

STRICT RULES:
- Return ONLY a valid JSON object with a single key: "bracuNotesContext"
- The value of "bracuNotesContext" must be a plain string
- NO markdown, NO code blocks, NO backticks, NO introduction, NO explanation
- If you cannot extract anything, return: {"bracuNotesContext": "No context extracted."}`
      },
      {
        role: 'user',
        content: `Course: ${courseCode}
Topic: ${topicName}
Step: ${stepOrder}

this is for lightweight revision Extract the core concepts from the notes including all technical definitions, formulas but skip historical relevance. Incase of complex example and simulation just extract the topic name, for example graph basics, dfs, bfc, etc.
 Be dense, bulleted, and exam-focused.
  Math data maybe noisy dont focus too much on extracting dense math concepts but summarize the core ideas so another llm can generate from them. Make sure to include just the most important concepts not all examples as content must fit one page email.

Text array containing objects with text and page numbers of the lecture slides:
${rawText}`
      }
    ],
    format: 'json'
  });

  let cleanJSON;
  try {
    const raw = response.message.content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    cleanJSON = JSON.parse(raw);
    console.log(cleanJSON);
  } catch (e) {
    console.warn('⚠️ JSON parse failed, using raw response as context');
    cleanJSON = { bracuNotesContext: response.message.content };
  }

  return {
    course: course,
    courseCode: courseCode,
    topic: topicName,
    order: Number(stepOrder),
    bracUNotesContext: cleanJSON.bracuNotesContext || cleanJSON.summary || "No context extracted."
  };
};

const runSyllabusFactory = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected safely to database.');

    for (const step of cse221Roadmap) {
      console.log(`\n🚀 Processing Step ${step.order}: ${step.topic}`);
      
      const pdfPath = path.join(__dirname, '..', 'etl-processor', 'raw-slides', step.fileName);
      
      if (!fs.existsSync(pdfPath)) {
        console.error(`❌ PDF file missing at: ${pdfPath}. Skipping.`);
        continue;
      }

      const existingMaterial = await Materials.findOne({ course: step.course, order: step.order });
      if (existingMaterial) {
        console.log(`⏩ Step ${step.order} already exists. Skipping.`);
        continue;
      }

      // Phase A: EXTRACT
      const dataBuffer = fs.readFileSync(pdfPath);
      const parser = new PDFParse({ data: dataBuffer });
      const parsedData = await parser.getText();
      const pages = extractPages(parsedData, step.startPage, step.endPage);
      console.log(pages);

      // console.log(`📄 Total pages: ${parsedData.numpages}`);
      // console.log(`📄 Extracting pages ${step.startPage}-${step.endPage}...`);

      

      // Phase B: TRANSFORM
      const distilledDocument = await callLocalLLMWithContext(
        pages,
        step.topic,
        step.order,
        step.course,
        step.courseCode
      );

      // Phase C: LOAD
      await Materials.findOneAndUpdate(
        { course: distilledDocument.course, order: distilledDocument.order },
        distilledDocument,
        { upsert: true, new: true }
      );
      console.log(`📥 Successfully loaded Step ${step.order} into MongoDB!`);
    }

    console.log('\n🏁 ETL Factory completed successfully.');

  } catch (error) {
    console.error('❌ ETL System Failure:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection safely disconnected.');
  }
};

runSyllabusFactory();