import axios from 'axios';
import mongoose from 'mongoose';
import ollama from 'ollama';
import CompanyGuide from '../models/companyGuide';
import parseFullGuideWithLLM from './llmParser';
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

    for (const file of mdFiles) {
      const companyName = file.name.replace('.md', '').toUpperCase();
      console.log(`\n--------------------------------------------`);
      console.log(`Processing Comprehensive Guide for [${companyName}]...`);

      // Extract raw text
      const rawContentResponse = await axios.get(file.download_url);
      const markdownText = rawContentResponse.data;

      // Transform via LLM
      console.log(`Querying Ollama (qwen2.5-coder:7b) to deeply parse structural guide...`);
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
          introduction: structuredGuide.introduction,
          interviewStages: structuredGuide.interviewStages,
          questions: structuredGuide.questions
        },
        { upsert: true, new: true }
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