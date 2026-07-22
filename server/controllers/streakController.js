import jwt from "jsonwebtoken";
import progress from "../models/progress.js";
import users from "../models/users.js";

export default async function syncStreak(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Missing or invalid link.");
    }

    // Verify and decode the signed token from the email
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).send("This link has expired or is invalid.");
    }

    const { id, courseCode, currentOrder } = decoded;
    const courseProgress= await progress.findOne({user: id, courseCode:courseCode})
        if(courseProgress.currentOrderStep !== courseProgress.targetOrderStep){
          return res.status(409).send("Progress already synced.")
        }
    const updated = await progress.findOneAndUpdate(
      { user: id, courseCode: courseCode, },
      {$inc: { targetOrderStep: 1 },
      $push: {completedTopics: {order: currentOrder, acedAt: new Date()} },},
      { new: true }
    );
      if (!updated) {
      return res.status(404).send("Progress record not found.");
    }
    console.log(`🎯 Aced It! User ${id} advanced to step ${updated.currentOrderStep} for ${courseCode}`);
    await users.findByIdAndUpdate(id, {isActive:true})
    

    res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // match your JWT's expiry
});

return res.redirect(`http://localhost:5173/progress`); 
    
    // Redirect the user to the progress page 
    } catch (err) {
    console.error(`❌ Error syncing streak: ${err}`);
    return res.status(500).send("Something went wrong.");
  }
}
