import { apiFootballService } from "../services/apiFootball.service.js";

export const getLiveMatches = async (req, res) => {
    try {
        const matches = await apiFootballService.getLiveMatchesByCountry(process.env.COUNTRY);
        res.json({ success: true, matches });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
