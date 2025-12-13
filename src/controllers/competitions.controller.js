import { apiFootballService } from "../services/apiFootball.service.js";

export const getAfricaCompetitions = async (req, res) => {
    try {
        const countries = process.env.AFRICA_COUNTRIES.split(",");
        const comps = await apiFootballService.getCompetitions(countries);
        res.json({ success: true, competitions: comps });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
