import jwt from "jsonwebtoken";
import progress from "../models/progress.js";
import users from "../models/users.js";
import generatedModules from "../models/generatedModules.js";

async function syncConfusion(req, res) {
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
    const confusedTopics = await generatedModules.find({
        courseCode:courseCode, 
    }).sort({createdAt: 1})
    const topic = confusedTopics[currentOrder-1]
    if (!topic) {
      return res.status(404).send("The topic being sent could not be found.");
    }
    
    const updated = await users.findOneAndUpdate(
      { _id: id  },
      {
      $push: {confusedVault: {moduleId:topic._id} }},
      { new: true }
    );
      if (!updated) {
      return res.status(404).send("User record not found.");
    }
    console.log(`🎯 Added to the vault!`);
    

    res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // match your JWT's expiry
});

return res.redirect(`http://localhost:5173/vault`); 
    
    // Redirect the user to the progress page 
    } catch (err) {
    console.error(`❌ Error syncing streak: ${err}`);
    return res.status(500).send("Something went wrong.");
  }
}

async function getConfusedTopics(req, res) {
  try {
    const userId = req.userId;

    const user = await users.findById(userId).populate("confusedVault.moduleId");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user.confusedVault);

  } catch (err) {
    console.error(` Error fetching confused vault: ${err}`);
    return res.status(500).json({ message: "Something went wrong." });
  }
}


export {syncConfusion,getConfusedTopics};