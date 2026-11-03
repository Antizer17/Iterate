import { runDailyEmailJob } from "../utils/mailer.js";
import { runSyncPipeline } from "../engines/interviewProcessor.js";

async function runTask(req, res) {
  const authHeader = req.headers['authorization'];
  const expectedHeader = `Bearer ${process.env.CRON_SECRET}`;
  if (!authHeader || authHeader !== expectedHeader) {
    return res.status(401).json({ error: 'Unauthorized: Invalid cron secret' });
  }
  try {
    console.log('Executing cron job...');
    await runDailyEmailJob();
    res.status(200).json({ success: true, message: "Content delivery successful!" });
  } catch (err) {
    console.error(`Error running email delivery function:${err}`);
    res.status(500).json({ error: err.message || err });
  }
}

let isSyncingGuides = false;

async function syncGuidesTask(req, res) {
  const authHeader = req.headers['authorization'];
  const expectedHeader = `Bearer ${process.env.CRON_SECRET}`;
  if (!authHeader || authHeader !== expectedHeader) {
    return res.status(401).json({ error: 'Unauthorized: Invalid cron secret' });
  }

  if (isSyncingGuides) {
    return res.status(409).json({ message: "Interview guides sync pipeline is already in progress." });
  }

  // Acknowledge the cron job immediately so it never times out
  res.status(202).json({ success: true, message: "Syncing initiated successfully in background!" });

  // Execute in the background
  isSyncingGuides = true;
  console.log('🚀 Executing interview guides sync cron task in background...');
  runSyncPipeline()
    .then((summary) => {
      console.log('✅ Guides sync pipeline completed successfully:', summary);
    })
    .catch((err) => {
      console.error('❌ Error running guides sync pipeline:', err.message || err);
    })
    .finally(() => {
      isSyncingGuides = false;
    });
}

function nudgeServer(req, res) {
  return res.status(200).send('pong');
}

export { runTask, syncGuidesTask, nudgeServer };