import express from "express";
import { getTeamsSA } from "../controllers/teams.controller.js";

const router = express.Router();

router.get("/", getTeamsSA);

export default router;
