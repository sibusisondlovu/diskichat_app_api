import express from "express";
import { getActiveCountries } from "../controllers/countries.controller.js";

const router = express.Router();

router.get("/", getActiveCountries);

export default router;
