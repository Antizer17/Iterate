
import progress from '../models/progress.js';  // Your UserProgress model
import connectDB from './dbConnect.js';
import content from '../models/materials.js'

export const seedProgressDB = async (userId) => {
  try {

    await connectDB();
    await content.updateMany({},{$set:{approved:true}})
    console.log(`🌱 Seeding pre-allocated progress rows for User: ${userId}...`);
    const allTopics = await content.find({ approved: true });
    if (allTopics.length === 0) {
      console.log("⚠️ Warning: No topics found in the materials collection to seed! Add some materials first.");
      return;
    }

    const progressPayload = allTopics.map(topicItem => ({
      user: userId,          
      topic: topicItem._id,  
      seenStatus: false,   
      SentDate: null
    }));


    await progress.insertMany(progressPayload, { ordered: false });

    console.log(`✅ Successfully pre-allocated ${progressPayload.length} revision topics for this user!`);
  } catch (err) {
    // Catch bulk write duplicate key errors gracefully if you run this twice
    if (err.code === 11000) {
      console.log("ℹ️ Some tracking rows already existed for this user. Skipped duplicates.");
    } else {
      console.error("❌ Seeding Error:", err);
    }
  }
};
seedProgressDB("6a05d1284dabf21a3c7aa4a1")