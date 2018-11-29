const triggerEvents = "direct_message,direct_mention";

module.exports = function(controller) {
    controller.hears(
        [/^did (.+) pay dues this semester/i],
        triggerEvents,
        function(bot, message) {
            bot.replyPublic(message, "TRIGGERED");
        }
    );
};
