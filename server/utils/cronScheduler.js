import cron from "node-cron";
import { runDailyEmailJob } from "./mailer.js";
import { runSyncPipeline } from "../engines/interviewProcessor.js";

const cronSchedular = () => {
  // Daily email revision delivery
  cron.schedule("41 02 * * *", async () => {
    try {
      console.log("Dispatching revision content...");
      await runDailyEmailJob();
      console.log("Content delivery successful!");
    } catch (err) {
      console.error(`Cron delivery failed!, ${err}`);
    }
  });

  // Scheduled interview guides sync (incremental; skips up-to-date guides)
  cron.schedule("00 03 * * *", async () => {
    try {
      console.log("Starting scheduled interview guides sync...");
      await runSyncPipeline();
      console.log("Scheduled interview guides sync completed!");
    } catch (err) {
      console.error(`Scheduled interview guides sync failed: ${err}`);
    }
  });
};

export default cronSchedular;