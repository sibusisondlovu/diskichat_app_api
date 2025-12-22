import express from "express";
import dotenv from "dotenv";
dotenv.config();

import matchesRoute from "./routes/matches.routes.js";
import teamsRoute from "./routes/teams.routes.js";
import competitionsRoutes from "./routes/competitions.routes.js";
import socialRoutes from "./routes/social.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import followsRoutes from "./routes/follows.routes.js";
import countriesRoutes from "./routes/countries.routes.js";
import lineupsRoute from "./routes/lineups.routes.js";

// start cron jobs
// import "./cron/liveMatches.cron.js"; // This might need rename too? Or just keep it.
import "./cron/teams.cron.js";
import "./cron/competitions.cron.js";
import "./cron/matchUpdate.cron.js";

const app = express();
app.use(express.json());
app.use("/api/matches", matchesRoute);
app.use("/api/teams", teamsRoute);
app.use("/api/competitions", competitionsRoutes);
app.use("/api/countries", countriesRoutes); // Priority
app.use("/api/lineups", lineupsRoute);
app.use("/api", socialRoutes);
app.use("/api", uploadRoutes);
app.use("/api", feedbackRoutes);
app.use("/api/follows", followsRoutes);

// Serve static files from public directory
app.use(express.static('public'));


export default app;
