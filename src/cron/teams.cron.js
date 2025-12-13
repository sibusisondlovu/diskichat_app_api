import cron from "node-cron";
import { fetchTeams } from "../services/teams.service.js";

// Schedule: At 00:00 on day-of-month 1 in every 10th month.
cron.schedule("0 0 1 */10 *", async () => {
    console.log("⏰ CRON: Running 10-month team sync...");
    try {
        const teams = await fetchTeams('South Africa');
        console.log(`✅ CRON: Teams updated. Count: ${teams.length}`);
    } catch (error) {
        console.error("❌ CRON: Failed to update teams:", error.message);
    }
});
