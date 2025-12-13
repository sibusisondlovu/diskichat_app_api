import express from "express";
import dotenv from "dotenv";
dotenv.config();

import liveRoute from "./routes/liveMatches.routes.js";
import teamsRoute from "./routes/teams.routes.js";
import competitionsRoute from "./routes/competitions.routes.js";

// start cron jobs
import "./cron/liveMatches.cron.js";
import "./cron/teams.cron.js";
import "./cron/competitions.cron.js";

const app = express();
app.use(express.json());

app.use("/api/live", liveRoute);
app.use("/api/teams", teamsRoute);
app.use("/api/competitions", competitionsRoute);

export default app;
