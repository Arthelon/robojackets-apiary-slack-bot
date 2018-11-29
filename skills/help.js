// TODO: have help message list all existing queries
const helpMessage = `This is a help message`;
const commandHandlers = {
    "/apiary-help": (bot, message) => {
        bot.replyPrivate(message, helpMessage);
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
};
