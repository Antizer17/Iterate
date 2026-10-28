import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { timeout: 60000 }
});

export default async function parseFullGuideWithLLM(companyName, markdownText) {
  const prompt = `You are an expert technical recruiter and software engineering data extractor.
Analyze this raw Markdown document containing the interview guide for ${companyName}.
Carefully parse the company overview, the chronological interview stages, and the interview questions.

IMPORTANT INSTRUCTIONS:
- Extract company metadata from the table at the top if present:
  * "foundingYear": e.g. "2013" (leave empty string if missing or empty in table)
  * "technologies": array of technology/stack strings mentioned in "Technologies Used" (e.g. ["Python", "NodeJS", "React", "MongoDB"]). Empty array if none.
  * "website": URL for "Company Website" if present, else empty string.
  * "careerUrl": URL for "Career Website" if present, else empty string.
- For each question, identify which interview stage or round it was asked in (e.g., "Round 1", "Phone Interview", "Take-Home Assignment", "Technical On-Site", "HR Round").
- If the question was listed under a specific section heading (like "## Phone Interview", "## First round Interview Questions", "## Take-Home Assignment Questions"), use that round name.
- If the markdown does not separate questions by round and just lists them under a general "## Questions" heading, default the stage to "Technical Round".
- If a question contains a code implementation/solution, extract that into "solutionCode" and keep the problem statement in "questionText".

Raw Markdown Payload:
"""
${markdownText}
"""`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            introduction: { 
              type: Type.STRING, 
              description: "Parsed context, description, or intro information about the company." 
            },
            foundingYear: {
              type: Type.STRING,
              description: "Founding year from metadata table if present, else empty string."
            },
            technologies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of technologies/tech stack mentioned under 'Technologies Used'."
            },
            website: {
              type: Type.STRING,
              description: "Company website URL if present, else empty string."
            },
            careerUrl: {
              type: Type.STRING,
              description: "Company careers website URL if present, else empty string."
            },
            interviewStages: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of stages/rounds described in the guide."
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionText: { type: Type.STRING, description: "The exact question asked." },
                  stage: { type: Type.STRING, description: "The round/stage this question was asked in (e.g. 'Phone Interview', 'Round 1', 'Take-Home Assignment', 'Technical Round')." },
                  category: {
                    type: Type.STRING,
                    enum: ["Database", "Operating Systems", "DSA", "System Design", "OOP", "Frontend", "Backend", "HR/Behavioral", "General CS"]
                  },
                  difficulty: {
                    type: Type.STRING,
                    enum: ["Easy", "Medium", "Hard"]
                  },
                  details: { type: Type.STRING, description: "Any extra notes, explanation, or context." },
                  solutionCode: { type: Type.STRING, description: "Code implementation if present, otherwise empty string." }
                },
                required: ["questionText", "stage", "category", "difficulty"]
              }
            }
          },
          required: ["introduction", "interviewStages", "questions"]
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return parsed;
  } catch (err) {
    console.error(`❌ Gemini Parsing Error for ${companyName}:`, err.message);
    return null;
  }
}
