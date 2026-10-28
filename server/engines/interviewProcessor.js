import axios from 'axios';
import mongoose from 'mongoose';
import CompanyGuide from '../models/companyGuide.js';
import parseFullGuideWithLLM from './llmParser.js';
const MONGO_URI = process.env.MONGODB_URI;


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runSyncPipeline() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected!");

    console.log("🌐 Fetching file list from GitHub...");
    const repoFilesUrl = "https://api.github.com/repos/TamimEhsan/interview-questions-bangladesh/contents/docs/companies";
    
    const githubResponse = await axios.get(repoFilesUrl, {
      headers: { 'User-Agent': 'Iterate-App-Sync-Engine' }
    });

    const mdFiles = githubResponse.data.filter(file => file.name.endsWith('.md') && file.name !== 'index.md');
    console.log(`📂 Found ${mdFiles.length} company markdown files to process.`);

    const forceSync = process.argv.includes('--force');
    const targetCompany = process.argv.find(arg => arg.startsWith('--company='))?.split('=')[1]?.toUpperCase();

    for (const file of mdFiles) {
  
      const companyName = file.name.replace('.md', '').toUpperCase();
      if (targetCompany && companyName !== targetCompany) {
        continue;
      }
      console.log(`\n--------------------------------------------`);
     
      const existing = await CompanyGuide.findOne({ company: companyName }).lean();
      const hasMetadata = existing && existing.technologies !== undefined && existing.foundingYear !== undefined;
      if (!forceSync && existing && existing.sha === file.sha && hasMetadata) {
        console.log(`⏩ [${companyName}] is already up to date (${file.sha.slice(0, 7)}). Skipping.`);
        continue;
      }
      console.log(`Processing Comprehensive Guide for [${companyName}]...`);

      // Extract raw text
      const rawContentResponse = await axios.get(file.download_url);
      const markdownText = rawContentResponse.data;

      // Transform via LLM
      console.log(`Querying Gemini (gemini-2.5-flash) to deeply parse structural guide...`);
      const structuredGuide = await parseFullGuideWithLLM(companyName, markdownText);
      
      if (!structuredGuide) {
        console.log(`Failed to parse structural data for ${companyName}. Skipping DB Load.`);
        continue;
      }

      // Load via Upsert
      console.log(`Saving full structural interview guide into MongoDB...`);
      await CompanyGuide.findOneAndUpdate(
        { company: companyName },
        {
          company: companyName,
          sha: file.sha,
          introduction: structuredGuide.introduction,
          foundingYear: structuredGuide.foundingYear || "",
          technologies: structuredGuide.technologies || [],
          website: structuredGuide.website || "",
          careerUrl: structuredGuide.careerUrl || "",
          interviewStages: structuredGuide.interviewStages,
          questions: structuredGuide.questions
        },
        { upsert: true, returnDocument: 'after' }
      );

      console.log(`✅ [${companyName}] guide successfully synced!`);
      await delay(1000); 
    }

    console.log("\nComplete Data Pipeline Finished Successfully! :D");
  } catch (err) {
    console.error("❌ Pipeline Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB Disconnected.");
  }
}


runSyncPipeline();