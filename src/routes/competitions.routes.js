import express from "express";
import { getAfricaCompetitions } from "../controllers/competitions.controller.js";

const router = express.Router();

router.get("/", getAfricaCompetitions);

export default router;
