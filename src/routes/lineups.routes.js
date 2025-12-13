import express from "express";
import { getLineups } from "../controllers/lineups.controller.js";

const router = express.Router();

router.get("/:fixtureId", getLineups);

export default router;
