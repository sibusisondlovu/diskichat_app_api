import cron from "node-cron";
import { fetchCompetitions } from "../services/competitions.service.js";

// Schedule: At 00:00 on day-of-month 1 in every 12th month.
cron.schedule("0 0 1 */12 *", async () => {
    console.log("⏰ CRON: Running 12-month competitions sync...");
    try {
        const count = await fetchCompetitions();
        console.log(`✅ CRON: Competitions updated. Leagues processed: ${count}`);
    } catch (error) {
        console.error("❌ CRON: Failed to update competitions:", error.message);
    }
});
