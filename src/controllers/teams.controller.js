import { apiFootballService } from "../services/apiFootball.service.js";

export const getTeamsSA = async (req, res) => {
    try {
        const teams = await apiFootballService.getTeamsByCountry(process.env.COUNTRY);
        res.json({ success: true, teams });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
