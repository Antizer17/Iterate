import mongoose from 'mongoose';
import content from '../models/materials.js'; // Your RevisionContent model
import connectDB from './dbConnect.js';

const approveAllContent = async () => {
  try {
    // 1. Wait for the database connection handshake
    await connectDB();
    console.log("🚀 Connected to database. Preparing to update content states...");

    // 2. Pass an empty filter {} to match ALL documents, and set approved to true
    const result = await content.updateMany(
      {}, // Filter criteria: empty object means "match everything"
      { $set: { approved: true } } // Atomic operator to update the specific field
    );

    console.log(`✨ Success! Matched ${result.matchedCount} documents and updated ${result.modifiedCount} of them to approved: true.`);
    
    // 3. Gracefully exit the background process
    process.exit(0);
  } catch (err) {
    console.error("❌ Error updating content permissions:", err);
    process.exit(1);
  }
};

approveAllContent();