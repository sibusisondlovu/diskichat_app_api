import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "Competitions route placeholder" });
});

export default router;
