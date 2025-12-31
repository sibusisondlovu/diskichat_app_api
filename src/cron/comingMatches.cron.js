import cron from "node-cron";
import { fetchAndStoreComingMatch } from "../services/comingMatches.service.js";

// Schedule: Every 4 hours
cron.schedule("0 */4 * * *", async () => {
    console.log("⏰ CRON: Running coming matches update (Every 4 hours)...");
    try {
        await fetchAndStoreComingMatch();
    } catch (error) {
        console.error("❌ CRON: Failed to update coming matches:", error.message);
    }
});
