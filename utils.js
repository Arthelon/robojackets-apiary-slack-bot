const axios = require("axios");
const httpClient = axios.create({
    baseURL: process.env.API_URL,
    headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`
    }
});

exports.httpClient = httpClient;
