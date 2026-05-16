import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import progress from '../models/progress.js';
import content from '../models/materials.js';
import users from '../models/users.js'; // Ensure the model is registered
import connectDB from './dbConnect.js';
import PDFDocument from 'pdfkit';


// 1. Configure your Nodemailer Transporter
// For production, swap this with SMTP details (e.g., Resend, Mailgun, or Gmail App Passwords)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Use a "Google App Password," not your real password
  }
});
const generateSolutionPDF = (material, activeQuizArray) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);

    // PDF Header Style
    doc.fillColor('#0f172a').fontSize(22).font('Helvetica-Bold').text('Iterate Prep // Official Solution Key', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#475569').font('Helvetica-Oblique').text(`Topic: ${material.topic}`);
    doc.moveDown(1.5);

    // Loop through questions to build structural text sheets
    activeQuizArray.forEach((q) => {
      const qNum = q.levelNumber || q.questionNumber;
      
      doc.fillColor('#0369a1').font('Helvetica-Bold').fontSize(12).text(`Concept Check #${qNum}`);
      doc.fillColor('#0f172a').font('Helvetica').fontSize(11).text(`${q.questionBody}`);
      doc.moveDown(0.5);

      // Print available choices
      q.options.forEach(opt => {
        doc.fillColor('#334155').fontSize(10).text(`  ${opt}`);
      });
      doc.moveDown(0.5);

      // Highlight the correct solution marker
      doc.fillColor('#15803d').font('Helvetica-Bold').fontSize(11).text(`Correct Answer: Option ${q.correctAnswer}`);
      doc.moveDown(0.3);
      
      // Print detailed design explanation
      doc.fillColor('#1e293b').font('Helvetica-Oblique').fontSize(10).text(`Explanation: ${q.solutionExplanation}`, {
        align: 'justify',
        lineGap: 2
      });
      
      doc.moveDown(2); // Spacing between questions
    });

    doc.end();
  });
};

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";


// 6. Dispatch the structured email
export const runDailyEmailJob = async () => {
  try {
    await connectDB();
    const userData = await users.find({});
    
    for (const user of userData) {
      const topicData = await progress.findOne({ user: user._id, seenStatus: false }).populate('topic');
      
      if (!topicData) {
        console.log(`⏩ Skipping ${user.name}: All caught up.`);
        continue;
      }

      const userEmail = user.email;
      const material = topicData.topic;

      if (!material) {
        console.warn(`⚠️ Warning: Missing topic reference on tracking card ${topicData._id}`);
        continue; 
      }

      const activeQuizArray = (material.quiz && material.quiz.length > 0) ? material.quiz : material.quizLevels;

      console.log(`📄 Generating dynamically compiled Solution PDF for ${user.name}...`);
      // Build the binary attachment asset
      const pdfBuffer = await generateSolutionPDF(material, activeQuizArray);

      // 2. Build the Email Configuration
      const mailOptions = {
        from: '"Iterate Prep" <noreply@iterateplatform.com>',
        to: "ahmad.sameer@g.bracu.ac.bd",
        subject: `Daily Revision: ${material.topic}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
            
            <span style="color: #6c757d; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
              Course: ${material.course} // Syllabus Refresher
            </span>
            <h1 style="margin-top: 5px; margin-bottom: 15px; color: #111; font-size: 24px; font-weight: 700;">
              ${material.topic}
            </h1>
            
            <div style="background-color: #f0f7ff; border-left: 4px solid #0070f3; padding: 12px 16px; margin-bottom: 25px; border-radius: 0 4px 4px 0;">
              <strong style="color: #0070f3; font-size: 14px;">Why recruiters ask this:</strong>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #334155;">${material.interviewRelevance}</p>
            </div>
            
            <div style="font-size: 16px; color: #1e293b; margin-bottom: 30px;">
              ${material.lessonBody}
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
              <a href="${BASE_URL}/api/streak/sync?userId=${user._id}&progressId=${topicData._id}" 
                 style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                 Lock In Today's Streak 🔥
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

      topicData.seenStatus = true;
      topicData.SentDate = new Date();
      await topicData.save();
    }
  } catch (err) {
    console.error("❌ Critical execution crash context:", err);
  }
};

runDailyEmailJob()