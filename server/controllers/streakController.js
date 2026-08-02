import jwt from "jsonwebtoken";
import progress from "../models/progress.js";
import users from "../models/users.js";
import generatedModules from "../models/generatedModules.js";
import processConfuseVault from "../engines/vaultProcessor.js";
import report from "../models/reportedContent.js";
import materials from "../models/materials.js";

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

return res.redirect(`${process.env.CLIENT_URL}/progress/${courseCode}`); 
    
    // Redirect the user to the progress page 
    } catch (err) {
    console.error(`❌ Error syncing streak: ${err}`);
    return res.status(500).send("Something went wrong.");
  }
}



async function syncConfusion(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Missing or invalid link.");
    }

    // 1. Verify and decode the signed token from the email
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).send("This link has expired or is invalid.");
    }

    const { id, courseCode, currentOrder } = decoded;

    await users.findByIdAndUpdate(id,{isActive:true})

    // 2. Fetch the corresponding topic module
    const confusedTopics = await generatedModules.find({
      courseCode: courseCode, 
    }).sort({ createdAt: 1 });
    
    const topic = confusedTopics[currentOrder - 1];
    if (!topic) {
      return res.status(404).send("The topic being sent could not be found.");
    }

    // 3. Find user and check if topic is already present in their vault
    const user = await users.findById(id).populate("confusedVault.moduleId");

    if (!user) {
      return res.status(404).send("User record not found.");
    }

    // Safe optional chaining guard to avoid crashes on null references
    if (user.confusedVault.some(obj => obj.moduleId?.topic === topic.topic)) {
      console.log("Topic already added to the vault!");
      return res.redirect(`${process.env.CLIENT_URL}/vault`);
    }

    console.log(`Name of topic being sent to ollama: ${topic.topic}`);
    
    // 4. Trigger scrapeless execution pipeline to fetch up to 3 links
    const videoArray = await processConfuseVault(topic.topic) || [];
    console.log(videoArray)
    
    const resource1 = videoArray[0] || null;
    const resource2 = videoArray[1] || null;
    const resource3 = videoArray[2] || null;

    // 5. Save module reference and video resources to user model
    const updatedUser = await users.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          confusedVault: { moduleId: topic._id, resources: [resource1, resource2, resource3].filter(Boolean) },
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User record not found.");
    }
    console.log(`🎯 Added to the vault!`);

    // 6. Update user course progress step tracking
    const courseProgress= await progress.findOne({user: id, courseCode:courseCode})
    if(courseProgress.currentOrderStep !== courseProgress.targetOrderStep){
      return res.status(409).send("Progress already synced.")
    }
    const userProgress = await progress.findOneAndUpdate(
      { user: id, courseCode: courseCode, },
      {
        $inc: { targetOrderStep: 1 },
        $push: { completedTopics: { order: currentOrder, acedAt: new Date() } }
      },
      { new: true }
    );

    if (!userProgress) {
      return res.status(404).send("Progress record not found.");
    }

    // 7. Refresh token context cookie and redirect home
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    return res.redirect(`${process.env.CLIENT_URL}/vault`); 
    
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
    console.error(`Error fetching confused vault: ${err}`);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

async function reportContent(req,res){
  try{
    const {token} = req.query
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

    let { id, courseCode, currentOrder } = decoded;
    currentOrder = currentOrder - 1
    console.log(currentOrder)
    const content = await materials.findOne({courseCode:courseCode, order: currentOrder })
    console.log(content)
    const check = await report.findOne({addedBy:id, material:content._id})
    if(check){
      return res.status(409).send("Content already reported.")
    }
    const reportData = new report({addedBy:id, material:content._id})
    await reportData.save()
    res.status(201).send("Thank you for reporting the content, we will review it as soon as possible.")
  }catch(err){
    return res.status(500).send(`Something went wrong :( ${err}`)
  }
}

async function getReportedContents(req, res) {
  try {
    const reports = await report.find()
      .populate("material")
      .populate("addedBy", "name email username");
    res.json({ data: reports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export { syncConfusion, getConfusedTopics, reportContent, getReportedContents };