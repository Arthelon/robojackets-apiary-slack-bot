var env = require("node-env-file");
env(__dirname + "/.env");

if (!process.env.clientId || !process.env.clientSecret || !process.env.PORT) {
    usage_tip();
    process.exit(1);
}

var Botkit = require("botkit");
var debug = require("debug")("botkit:main");

var bot_options = {
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    clientSigningSecret: process.env.clientSigningSecret,
    // debug: true,
    scopes: ["bot", "im:write", "chat:write:bot", "users.info"],
    studio_token: process.env.studio_token,
    studio_command_uri: process.env.studio_command_uri
};

// Keep ./skills/help as the last path as it triggers the fallback listener
const SKILLS_PATHS = ["./skills/user", "./skills/help"];

// Use a mongo database if specified, otherwise store in a JSON file local to the app.
// Mongo is automatically configured when deploying to Heroku
if (process.env.MONGO_URI) {
    var mongoStorage = require("botkit-storage-mongo")({
        mongoUri: process.env.MONGO_URI
    });
    bot_options.storage = mongoStorage;
} else {
    bot_options.json_file_store = __dirname + "/.data/db/"; // store user data in a simple JSON format
}

// Create the Botkit controller, which controls all instances of the bot.
var controller = Botkit.slackbot(bot_options);

controller.startTicking();

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + "/components/express_webserver.js")(
    controller
);

if (!process.env.clientId || !process.env.clientSecret) {
    // Load in some helpers that make running Botkit on Glitch.com better
    require(__dirname + "/components/plugin_glitch.js")(controller);

    webserver.get("/", function(req, res) {
        res.render("installation", {
            studio_enabled: controller.config.studio_token ? true : false,
            domain: req.get("host"),
            protocol: req.protocol,
            glitch_domain: process.env.PROJECT_DOMAIN,
            layout: "layouts/default"
        });
    });

    var where_its_at = "https://" + process.env.PROJECT_DOMAIN + ".glitch.me/";
    console.log(
        "WARNING: This application is not fully configured to work with Slack. Please see instructions at " +
            where_its_at
    );
} else {
    webserver.get("/", function(req, res) {
        res.render("index", {
            domain: req.get("host"),
            protocol: req.protocol,
            glitch_domain: process.env.PROJECT_DOMAIN,
            layout: "layouts/default"
        });
    });
    // Set up a simple storage backend for keeping a record of customers
    // who sign up for the app via the oauth
    require(__dirname + "/components/user_registration.js")(controller);

    // Send an onboarding message when a new team joins
    require(__dirname + "/components/onboarding.js")(controller);

    // Load in some helpers that make running Botkit on Glitch.com better
    require(__dirname + "/components/plugin_glitch.js")(controller);

    SKILLS_PATHS.forEach(path => {
        require(path)(controller);
    });
}

function usage_tip() {
    console.log("~~~~~~~~~~");
    console.log("Botkit Starter Kit");
    console.log("Execute your bot application like this:");
    console.log(
        "clientId=<MY SLACK CLIENT ID> clientSecret=<MY CLIENT SECRET> PORT=3000 studio_token=<MY BOTKIT STUDIO TOKEN> node bot.js"
    );
    console.log("Get Slack app credentials here: https://api.slack.com/apps");
    console.log("Get a Botkit Studio token here: https://studio.botkit.ai/");
    console.log("~~~~~~~~~~");
}
