import mongoose from 'mongoose';
import progress from '../models/progress.js';
import content from '../models/materials.js';
import users from '../models/users.js'; 
import connectDB from './dbConnect.js';
import calculatePriority from '../engines/prioritySchedular.js';
import fetchGenerate from '../engines/fetchGenerate.js'; 
import { marked } from 'marked';
import getLinkToken from './linkTokenGenerator.js';
import generateSolutionPDF from '../engines/buildPDF.js';
import transporter from '../config/transporterConfig.js';







const BASE_URL = process.env.BASE_URL || "http://localhost:1700";


// 6. Dispatch the structured email
export const runDailyEmailJob = async () => {
  try {
    await connectDB();
    const userData = await users.find({
      isActive:true
    });
    
    for (const user of userData) {
      const checkerData = await progress.find({user:user._id});
      const isCheck = checkerData.filter(obj => obj.currentOrderStep===obj.targetOrderStep);
      if(isCheck.length>0){
        await users.findOneAndUpdate(user._id,{isActive:false});
        continue;
      }

      const currentTopicData = await calculatePriority(user);
      
      if (!currentTopicData) {
        console.log(`⏩ Skipping ${user.name}: Not enrolled in any courses.`);
        continue;
      }

      const userEmail = user.email;
      const material = await fetchGenerate(currentTopicData[1], currentTopicData[2]);
      const linkToken = await getLinkToken(user._id,currentTopicData[1], currentTopicData[2])

      if (!material) {
        console.warn(`⚠️ Warning: Missing relevant materials for topic`);
        continue; 
      }

      const activeQuizArray = (material.quiz && material.quiz.length > 0) ? material.quiz : material.quizLevels;

      console.log(`📄 Generating dynamically compiled Solution PDF for ${user.name}, ${userEmail}...`);
      // Build the binary attachment asset
      const pdfBuffer = await generateSolutionPDF(material, activeQuizArray);
      // Convert markdown to HTML before injecting
      const lessonBodyHTML = marked.parse(material.lessonBody);

      // 2. Build the Email Configuration
      const mailOptions = {
        from: '"Iterate Prep" <noreply@iterateplatform.com>',
        to: userEmail,
        subject: `Daily Revision: ${material.topic}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
            
            <span style="color: #6c757d; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
              Course: ${material.courseCode} // Syllabus Refresher
            </span>
            <h1 style="margin-top: 5px; margin-bottom: 15px; color: #111; font-size: 24px; font-weight: 700;">
              ${material.topic}
            </h1>
            
            <div style="background-color: #f0f7ff; border-left: 4px solid #0070f3; padding: 12px 16px; margin-bottom: 25px; border-radius: 0 4px 4px 0;">
              <strong style="color: #0070f3; font-size: 14px;">Why recruiters ask this:</strong>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #334155;">${material.interviewRelevance}</p>
            </div>
            
            <div style="font-size: 16px; color: #1e293b; margin-bottom: 30px;">
  <style>
    ul { padding-left: 20px; margin: 8px 0; }
    li { margin-bottom: 6px; }
    strong { color: #0f172a; }
    p { margin: 0 0 12px 0; }
  </style>
  ${lessonBodyHTML}
</div>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
              <h3 style="margin-top: 0; color: #0f172a;">🧠 Practice Questions Included!</h3>
              <p style="font-size: 14px; color: #475569; margin-bottom: 0;">
                Test yourself mentally using the choices below. We have attached a clean, fully formatted <b>Solution Guide PDF</b> directly to this email containing the answer choices, correct flags, and core architectural breakdown breakdowns!
              </p>
            </div>

            <!-- Display clean questions inside email body without answer disclosures -->
            ${activeQuizArray && activeQuizArray.length > 0 ? activeQuizArray.map((q) => {
              const qNum = q.levelNumber || q.questionNumber;
              return `
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                  <span style="color: #0369a1; font-size: 11px; font-weight: 700; text-transform: uppercase;">Question #${qNum}</span>
                  <p style="font-size: 15px; font-weight: 600; color: #0f172a; margin-top: 8px;">${q.questionBody}</p>
                 <div style="margin-top: 15px;">
  ${q.options.map((opt, idx) => `
    <label 
      style="
        display: block;
        padding: 10px 12px;
        margin-bottom: 8px;
        background: #f1f5f9;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
      "
    >
      <input 
        type="radio" 
        name="question-${qNum}" 
        value="${idx}"
        style="margin-right: 10px;"
      />
      ${opt}
    </label>
  `).join('')}
</div
                </div>
              `;
            }).join('') : ''}

            <div style="text-align: center; margin-top: 35px; border-top: 1px dashed #cbd5e1; padding-top: 25px;">
              <a href="${BASE_URL}/api/streak/sync?token=${linkToken}" 
                 style="display: inline-block; background-color: #000000; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                 Aced It!
              </a>
              <a href="${BASE_URL}/api/streak/confused?token=${linkToken}" 
                 style="display: inline-block; background-color: #000; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                Confused...
              </a>
              <a href="${BASE_URL}/api/streak/report?token=${linkToken}" 
                 style="display: inline-block; background-color: #DC2626; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
               Report
              </a>
            </div>
          </div>
        `,
        // 🌟 ATTACH THE GENERATED IN-MEMORY BUFFER DIRECTLY
        attachments: [
          {
            filename: `${material.topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_solutions.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Dispatched email with PDF Attachment to: ${userEmail}`);

      await progress.findOneAndUpdate({
        user: user._id,
        courseCode: currentTopicData[1],
        currentOrderStep: currentTopicData[2] 
      }, {
      
    $set: { lastServedAt: new Date() }, 
    $inc: {currentOrderStep: 1}  
  
      })
      
    }
  } catch (err) {
    console.error("❌ Critical execution crash context:", err);
  }
};

