const axios = require("axios");
const debug = require("debug")("skills::dues");
const triggerEvents = "direct_message,direct_mention";
const httpClient = axios.create({
    baseURL: process.env.API_URL,
    headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`
    }
});

function sendFail(bot, message) {
    bot.reply(
        message,
        "Something went wrong. Please see bot error logs for more information."
    );
}

module.exports = function(controller) {
    controller.hears(
        [/^did (.+) pay dues this semester/i],
        triggerEvents,
        async function(bot, message) {
            const name = message.match[1];
            try {
                console.log(process.env.API_URL);
                const resp = await httpClient.get("/users/search", {
                    params: {
                        keyword: name
                    }
                });
                debug(resp.data);
                const users = resp.data.users;
                if (users.length > 0) {
                    bot.reply(message, `Found a user: ${users[0].full_name}`);
                } else {
                    bot.reply(
                        message,
                        "Sorry, I was not able to find the user you specified."
                    );
                }
            } catch (err) {
                debug(err);
                sendFail(bot, message);
            }
        }
    );
};
