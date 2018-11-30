const axios = require("axios");
const debug = require("debug")("skills::user");
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

async function findUser(name) {
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
    const users = resp.data.users;
    if (users.length === 0) {
        bot.reply(
            message,
            "Sorry, I was not able to find the user you specified."
        );
        return;
    }
    return users[0];
}

async function paidDuesListener(bot, message) {
    const name = message.match[1];
    const user = await findUser(name);
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

async function shirtSizeListener(bot, message) {
    const name = message.match[1];
    const user = await findUser(name);
    debug(user);
    const shirtSize = user.shirt_size;
    if (shirtSize) {
        bot.reply(
            message,
            `${user.full_name} has a shirt size of ${shirtSize.toUpperCase()}.`
        );
    } else {
        bot.reply(
            message,
            `Sorry, I was not able to find a shirt size for ${user.full_name}.`
        );
    }
}

module.exports = function(controller) {
    controller.hears(
        [/^did (.+) pay dues this semester/i],
        triggerEvents,
        paidDuesListener
    );
    controller.hears(
        [/^what shirt size is (.+)/i],
        triggerEvents,
        shirtSizeListener
    );
};
