import content from '../models/materials.js';
import getLinkToken from './linkTokenGenerator.js';
import brevo from '../config/transporterConfig.js';

const BASE_URL = process.env.BASE_URL || "https://api.iterate-app.me";

/**
 * Dispatches a reminder email when a user has not acknowledged yesterday's topic.
 * Prompts them with "Aced" / "Confused" buttons to resume their revisions.
 *
 * @param {Object} user - The user mongoose document
 * @param {Object} pendingProgress - The progress record where currentOrderStep === targetOrderStep
 */
export default async function sendReminderEmail(user, pendingProgress) {
  try {
    const pendingOrder = pendingProgress.currentOrderStep - 1;
    const material = await content.findOne({
      courseCode: pendingProgress.courseCode,
      order: pendingOrder
    });

    const topicTitle = material?.topic || `Topic #${pendingOrder}`;
    const linkToken = await getLinkToken(user._id, pendingProgress.courseCode, pendingOrder);

    const emailParams = {
      sender: { name: "Iterate", email: "study@iterate-app.me" },
      to: [{ email: user.email }],
      subject: `Revision on pause: ${topicTitle} ⏳`,
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
          <span style="color: #6c757d; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            Course: ${pendingProgress.courseCode} // Action Required
          </span>
          <h1 style="margin-top: 5px; margin-bottom: 15px; color: #111; font-size: 22px; font-weight: 700;">
            Keep your revision streak alive!
          </h1>
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 20px; border-radius: 0 4px 4px 0;">
            <strong style="color: #b45309; font-size: 14px;">We've paused new daily revisions</strong>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #78350f;">
              We noticed you haven't reviewed yesterday's topic: <strong>${topicTitle}</strong>. 
              To keep your inbox clean and prevent unread topics from piling up, we've paused new emails.
            </p>
          </div>
          <p style="font-size: 15px; color: #475569; margin-bottom: 25px;">
            How did you find <strong>${topicTitle}</strong>? Tap below to record your response and immediately unpause your daily revisions:
          </p>
          <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px dashed #cbd5e1;">
            <a href="${BASE_URL}/api/streak/sync?token=${linkToken}" 
               style="display: inline-block; background-color: #000000; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-right: 12px;">
               Aced It 👍
            </a>
            <a href="${BASE_URL}/api/streak/confused?token=${linkToken}" 
               style="display: inline-block; background-color: #4b5563; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
               Confused 🤔
            </a>
          </div>
          <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 30px;">
            Clicking either option automatically updates your progress tree and resumes tomorrow's revision.
          </p>
        </div>
      `
    };

    await brevo.transactionalEmails.sendTransacEmail(emailParams);
    console.log(`✅ Dispatched pause reminder email to: ${user.email} for ${topicTitle}`);
  } catch (err) {
    console.error(`❌ Error dispatching reminder email to ${user.email}:`, err);
  }
}
