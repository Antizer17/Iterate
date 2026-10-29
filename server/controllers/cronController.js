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

async function syncGuidesTask(req, res) {
  const authHeader = req.headers['authorization'];
  const expectedHeader = `Bearer ${process.env.CRON_SECRET}`;
  if (!authHeader || authHeader !== expectedHeader) {
    return res.status(401).json({ error: 'Unauthorized: Invalid cron secret' });
  }
  try {
    res.status(202).json({success: true,message: "Syncing initiated successfully!"})
    console.log('Executing interview guides sync cron task...');
    const result = await runSyncPipeline();
    res.status(200).json({ success: true, message: "Guides sync pipeline completed!", result });
  } catch (err) {
    console.error(`Error running guides sync pipeline:${err}`);
    res.status(500).json({ error: err.message || err });
  }
}

function nudgeServer(req, res) {
  return res.status(200).send('pong');
}

export { runTask, syncGuidesTask, nudgeServer };