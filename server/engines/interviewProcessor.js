import axios from 'axios';
import mongoose from 'mongoose';
import CompanyGuide from '../models/companyGuide.js';
import parseFullGuideWithLLM from './llmParser.js';
const MONGO_URI = process.env.MONGODB_URI;


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runSyncPipeline() {
  const shouldDisconnect = mongoose.connection.readyState === 0;
  try {
    if (shouldDisconnect) {
      console.log("Connecting to MongoDB...");
      await mongoose.connect(MONGO_URI);
      console.log("MongoDB Connected!");
    }

    console.log("🌐 Fetching file list from GitHub...");
    const repoFilesUrl = "https://api.github.com/repos/TamimEhsan/interview-questions-bangladesh/contents/docs/companies";
    
    const githubResponse = await axios.get(repoFilesUrl, {
      headers: { 'User-Agent': 'Iterate-App-Sync-Engine' }
    });

    const mdFiles = githubResponse.data.filter(file => file.name.endsWith('.md') && file.name !== 'index.md');
    console.log(`📂 Found ${mdFiles.length} company markdown files to process.`);

    const forceSync = process.argv.includes('--force');
    const targetCompany = process.argv.find(arg => arg.startsWith('--company='))?.split('=')[1]?.toUpperCase();

    let syncedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    let quotaExceeded = false;

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
        skippedCount++;
        continue;
      }
      console.log(`Processing Comprehensive Guide for [${companyName}]...`);

      // Extract raw text
      const rawContentResponse = await axios.get(file.download_url);
      const markdownText = rawContentResponse.data;

      // Transform via LLM
      console.log(`Querying Gemini (gemini-2.5-flash) to deeply parse structural guide...`);
      const structuredGuide = await parseFullGuideWithLLM(companyName, markdownText);
      
      if (!structuredGuide || structuredGuide.error) {
        if (structuredGuide?.isQuotaExceeded) {
          console.log(`\n⚠️ Gemini API daily free tier quota reached (429). Halting sync loop until quota resets.`);
          quotaExceeded = true;
          break;
        }
        console.log(`Failed to parse structural data for ${companyName}. Skipping DB Load.`);
        failedCount++;
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
      syncedCount++;
      await delay(2500); 
    }

    const summary = {
      totalFound: mdFiles.length,
      syncedCount,
      skippedCount,
      failedCount,
      quotaExceeded
    };
    console.log(`\nData Pipeline Summary: ${syncedCount} synced, ${skippedCount} skipped, ${failedCount} failed, quotaExceeded: ${quotaExceeded}.`);
    return summary;
  } catch (err) {
    console.error("❌ Pipeline Error:", err.message);
    throw err;
  } finally {
    if (shouldDisconnect) {
      await mongoose.disconnect();
      console.log("🔌 MongoDB Disconnected.");
    }
  }
}

const isCLI = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('interviewProcessor.js');
if (isCLI) {
  runSyncPipeline().catch(err => console.error("Sync CLI execution error:", err));
}

export default runSyncPipeline;
export { runSyncPipeline };