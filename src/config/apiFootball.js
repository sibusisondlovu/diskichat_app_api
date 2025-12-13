import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const apiFootball = axios.create({
    baseURL: process.env.API_FOOTBALL_HOST,
    headers: {
        'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
        'x-rapidapi-host': process.env.API_FOOTBALL_HOST.replace('https://', '')
    }
});

export default apiFootball;
