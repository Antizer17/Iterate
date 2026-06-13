import sendDailyRevision from "./mailer.js"
import content from "../models/materials.js"
import mongoose from "mongoose";
import connectDB from "./dbConnect.js"

async function handleEmailTask() {
  try {
    await connectDB()
    const data = await content.findOne({topic:/^Encapsulation/});
    const result = await sendDailyRevision('ahmad.sameer@g.bracu.ac.bd', data);
    
    console.log("Email sent successfully!", result.messageId);
  } catch (error) {
    console.error("The email failed to send:", error);
  }
}
handleEmailTask()