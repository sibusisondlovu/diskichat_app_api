import cron from "node-cron";
import { apiFootballService } from "../services/apiFootball.service.js";

cron.schedule("0 0 1 */12 *", async () => {
    console.log("Running 12-month competitions sync...");

    const countries = process.env.AFRICA_COUNTRIES.split(",");
    const comps = await apiFootballService.getCompetitions(countries);

    // TODO: save to DB
    console.log("Stored competitions count:", comps.length);
});
