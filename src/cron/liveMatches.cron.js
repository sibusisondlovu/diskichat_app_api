import cron from "node-cron";
import { apiFootballService } from "../services/apiFootball.service.js";

cron.schedule("0 0 * * *", async () => {
    console.log("Running daily live match update...");

    const matches = await apiFootballService.getLiveMatchesByCountry(process.env.COUNTRY);

    // TODO: save to DB
    console.log("Stored live matches count:", matches.length);
});
