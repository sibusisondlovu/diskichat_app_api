import cron from "node-cron";
import { apiFootballService } from "../services/apiFootball.service.js";

cron.schedule("0 0 1 */10 *", async () => {
    console.log("Running 10-month team sync...");

    const teams = await apiFootballService.getTeamsByCountry(process.env.COUNTRY);

    // TODO: save to DB
    console.log("Stored teams count:", teams.length);
});
