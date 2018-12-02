const HELP_MESSAGE = `Here is a list of things you can ask me:

• did _*USER*_ pay dues this semester
• what shirt size is _*USER*_
`;
const commandHandlers = {
    "/apiary-help": (bot, message) => {
        bot.replyPrivate(message, HELP_MESSAGE);
    }
};

module.exports = function(controller) {
    controller.on("slash_command", function(bot, message) {
        const command = message.command;
        if (command in commandHandlers) {
            commandHandlers[command](bot, message);
        } else {
            bot.replyPrivate(
                message,
                "Sorry, we think you might have entered an invalid slash command. Please try again!"
            );
        }
    });
    controller.hears([/^help?/], "direct_message,direct_mention", function(
        bot,
        message
    ) {
        bot.reply(message, HELP_MESSAGE);
    });
    // Fallback Listener
    controller.hears(/.*/, "direct_message,direct_mention", function(
        bot,
        message
    ) {
        bot.reply(
            message,
            `Sorry, I did not understand your query. ${HELP_MESSAGE}`
        );
    });
};
