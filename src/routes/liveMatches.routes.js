import express from "express";
import { getLiveMatches } from "../controllers/liveMatches.controller.js";

const router = express.Router();
router.get("/", getLiveMatches);

export default router;
