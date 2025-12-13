import cron from "node-cron";
import { fetchLiveMatches } from "../services/liveMatches.service.js";

// Schedule: Every minute
cron.schedule("* * * * *", async () => {
    console.log("⏰ CRON: Running daily live match update...");
    try {
        const matches = await fetchLiveMatches();
        console.log(`✅ CRON: Live matches updated. Count: ${matches.length}`);
    } catch (error) {
        console.error("❌ CRON: Failed to update live matches:", error.message);
    }
});
