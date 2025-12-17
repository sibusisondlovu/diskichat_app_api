import express from "express";
import { getMatches } from "../controllers/matches.controller.js";

const router = express.Router();
router.get("/", getMatches);

export default router;
