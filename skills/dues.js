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
            let resp;
            try {
                resp = await httpClient.get("/users/search", {
                    params: {
                        keyword: name
                    }
                });
            } catch (err) {
                debug(err);
                sendFail(bot, message);
            }
            debug(resp.data.users);
            const users = resp.data.users;
            if (users.length === 0) {
                bot.reply(
                    message,
                    "Sorry, I was not able to find the user you specified."
                );
                return;
            }
            const user = users[0];
            debug(user);
            if (user.is_active) {
                bot.reply(
                    message,
                    `${user.full_name} has paid dues for this semester.`
                );
            } else {
                bot.reply(
                    message,
                    `${user.full_name} has not paid dues for this semester.`
                );
            }
        }
    );
};
