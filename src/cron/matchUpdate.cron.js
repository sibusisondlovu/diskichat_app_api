import cron from "node-cron";
import { updateMatchData } from "../services/matchUpdate.service.js";

// Schedule: Every 5 minutes
cron.schedule("*/5 * * * *", async () => {
    console.log("⏰ CRON: Running match update (5 mins)...");
    await updateMatchData();
});
