import fs from 'fs';
import path, { parse } from 'path';
import { fileURLToPath } from 'url';
import { PDFParse } from 'pdf-parse';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});



const cse221Roadmap = [
  { order: 1, topic: "Algorithm Fundamentals", fileName: "1.pdf" },
    { order: 2, topic: "Complexity Analysis", fileName: "1.pdf" },
];

const callOpenAIWithContext = async (rawText, topicName, stepOrder, courseCode) => {
  console.log(`Sending '${topicName}' to OpenAI for structured distillation...`);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a precise computer science data ingestion agent. You take messy text extracted from university slides and distill it into high-yield academic summaries for a revision database.'
      },
      {
        role: 'user',
        content: `Analyze the following raw university slide text for the course '${courseCode}'. 
        
        Target Topic: ${topicName}
        Syllabus Order Step: ${stepOrder}

        Distill the core technical definitions, criteria, formulas, or code structures into a high-yield, dense context string. Clean up any broken text formatting from the PDF extraction.

        Raw Slide Text:
        ${rawText}`
      }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'syllabus_material',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            course: { type: 'string', enum: ['dsa', 'os', 'dbms', 'networks'] },
            topic: { type: 'string' },
            order: { type: 'number' },
            bracuNotesContext: { type: 'string', description: 'Dense, clean academic summary of formulas, properties, pseudocode, and core concepts extracted from the slides.' }
          },
          required: ['course', 'topic', 'order', 'bracuNotesContext'],
          additionalProperties: false
        }
      }
    }
  });

  return JSON.parse(response.choices[0].message.content);
};


const runSyllabusFactory = async () => {
  try {
    for (const step of cse221Roadmap) {
      console.log(`\nStarting Step ${step.order}: ${step.topic}`);
      
      const pdfPath = path.join(
  __dirname,
  '..',
  'etl-processor',
  'raw-slides',
  '1.pdf'
);
      
      if (!fs.existsSync(pdfPath)) {
        console.error(`File missing on disk: ${pdfPath}. Skipping to next step.`);
        continue;
      }

      // Extract
      const dataBuffer = fs.readFileSync(pdfPath);
      const parser = new PDFParse({
    data:dataBuffer
});
      const parsedData = await parser.getText();
      
      // Transform
      const distilledJSON = await callOpenAIWithContext(
        parsedData, 
        step.topic, 
        step.order, 
        "dsa" // Hardcoded to Data Structures & Algorithms for this array run
      );
      
      console.log(' --- TRANSFORMED DATA RECEIVED --- ');
      console.log(distilledJSON);
      console.log('───────────────────────────────────────');
      
      // TODO: Load (We will connect mongoose.connect() here next!)
    }
    
    console.log('\n Factory processing run completed!');

  } catch (error) {
    console.error(' Factory Process failed:', error);
  }
};

runSyllabusFactory();