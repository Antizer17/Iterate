export default async function parseFullGuideWithLLM(companyName, markdownText) {
  const prompt = `
You are an advanced software engineering data extraction engine. Parse this raw Markdown document containing information regarding the interview process for ${companyName}.
The markdown typically reads chronologically: an introduction or background information about the company, details regarding the overall structure or stages of the interview process, followed by real interview questions which may or may not include code solutions.

Your goal is to parse this information cleanly into a single valid JSON object.

CRITICAL RULES:
- Only return a raw JSON object matching the format below. Do not include markdown code block containers (\`\`\`json) or conversational text.
- If a question includes a code example or complete implementation solution block, isolate that exact code block and store it inside the "solutionCode" string field. Do not leave the code lumped together with the question text.
- Clean up any messy HTML tags or broken syntax.

Raw Markdown Payload:
"""
${markdownText}
"""

Expected Output Schema Format:
{
  "introduction": "The parsed context, description, or intro information about the company from the top of the file.",
  "interviewStages": [
    "Stage 1 description (e.g., Online Coding Assessment - 3 problems, 90 mins)",
    "Stage 2 description (e.g., Technical Interview - Core DSA and Architecture)",
    "Stage 3 description (e.g., HR & Behavioral Round)"
  ],
  "questions": [
    {
      "questionText": "The exact question asked",
      "category": "DSA",
      "difficulty": "Medium",
      "details": "Any extra notes, non-code explanation, or contextual advice provided for this question.",
      "solutionCode": "function solve() { ... } // Leave completely empty if no solution code snippet is present"
    }
  ]
}
`;

  try {
    const response = await ollama.generate({
      model: "qwen2.5-coder:7b",
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.1 
      }
    });

    const rawJSONText = response.response
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(rawJSONText);
  } catch (err) {
    console.error(`❌ Ollama Parsing Error for ${companyName}:`, err.message);
    return null;
  }
}
