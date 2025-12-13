import { api } from "../config/apiFootball.js";

export const apiFootballService = {
    getLiveMatchesByCountry: async (country) => {
        const res = await api.get(`/fixtures`, {
            params: {
                live: "all"
            }
        });

        return res.data.response.filter(
            match => match.league.country.toLowerCase() === country.toLowerCase()
        );
    },

    getTeamsByCountry: async (country) => {
        const res = await api.get(`/teams`, {
            params: { country }
        });

        return res.data.response;
    },

    getCompetitions: async (countries) => {
        const competitions = [];

        for (const c of countries) {
            const res = await api.get(`/leagues`, {
                params: { country: c }
            });

            competitions.push(...res.data.response);
        }

        return competitions;
    }
};
