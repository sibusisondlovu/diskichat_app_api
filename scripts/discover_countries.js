import apiFootball from '../src/config/apiFootball.js';

const LEAGUE_IDS = [288, 509, 507, 508, 39, 140, 78, 135, 2, 12, 6, 1];

const discover = async () => {
    console.log("Discovering countries for leagues:", LEAGUE_IDS);

    for (const id of LEAGUE_IDS) {
        try {
            const response = await apiFootball.get('/leagues', {
                params: { id: id }
            });

            if (response.data.response.length > 0) {
                const data = response.data.response[0];
                const country = data.country.name;
                const name = data.league.name;
                const season = data.seasons[data.seasons.length - 1].year;
                console.log(`ID: ${id} -> Country: ${country}, League: ${name}, Latest Season: ${season}`);
            } else {
                console.log(`ID: ${id} -> No Data`);
            }
        } catch (e) {
            console.error(`ID: ${id} -> Error: ${e.message}`);
        }
    }
};

discover();
