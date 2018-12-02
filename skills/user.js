const axios = require("axios");
const debug = require("debug")("skills::user");
const triggerEvents = "direct_message,direct_mention";
const httpClient = axios.create({
    baseURL: process.env.API_URL,
    headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`
    }
});
const SLACK_ID_REGEX = /^<@(.+?)>$/;

function sendFail(bot, message) {
    bot.reply(
        message,
        "Something went wrong. Please see bot error logs for more information."
    );
}

async function findUser(bot, message, name) {
    let resp;
    const slackIdMatch = SLACK_ID_REGEX.exec(name);
    if (slackIdMatch) {
        const slackId = slackIdMatch[1];
        const email = await new Promise((resolve, reject) => {
            bot.api.users.info({ user: slackId }, function(err, resp) {
                if (err) {
                    reject(err);
                } else {
                    debug(resp.user.profile);
                    resolve(resp.user.profile.email);
                }
            });
        });
        if (email) {
            name = email.substring(0, email.indexOf("@"));
        }
    }
    debug(name);
    resp = await httpClient.get("/users/search", {
        params: {
            keyword: name
        }
    });
    const users = resp.data.users;
    if (users.length === 0) {
        bot.reply(
            message,
            "Sorry, I was not able to find the user you specified."
        );
        return null;
    }
    return users[0];
}

async function paidDuesListener(bot, message) {
    const name = message.match[1];
    try {
        const user = await findUser(bot, message, name);
        if (!user) {
            return;
        } else if (user.is_active) {
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
    } catch (err) {
        debug(err);
        sendFail(bot, message);
    }
}

async function shirtSizeListener(bot, message) {
    const name = message.match[1];
    try {
        const user = await findUser(bot, message, name);
        if (!user) {
            return;
        }
        const shirtSize = user.shirt_size;
        if (shirtSize) {
            bot.reply(
                message,
                `${
                    user.full_name
                } has a shirt size of ${shirtSize.toUpperCase()}.`
            );
        } else {
            bot.reply(
                message,
                `Sorry, I was not able to find a shirt size for ${
                    user.full_name
                }.`
            );
        }
    } catch (err) {
        debug(err);
        sendFail(bot, message);
    }
}

module.exports = function(controller) {
    controller.hears(
        [/^(?:did|has) (.+) (?:pay|paid) dues (?:for )?this semester/i],
        triggerEvents,
        paidDuesListener
    );
    controller.hears(
        [/^what shirt size is (.+?)\?+?/i],
        triggerEvents,
        shirtSizeListener
    );
};
