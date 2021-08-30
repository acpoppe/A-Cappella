const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const Config = require("../config.json");
const fs = require("fs");

const commands = [];
const commandFiles = fs.readdirSync("../commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands.push(command.data.toJSON());
}

let token = "";
let clientId = "";

if (!Config.devMode) {
    token = Config.token;
    clientId = Config.clientId;
} else {
    token = Config.devToken;
    clientId = Config.devClientId;
}

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );

        console.log("Successfully registered application commands");
    } catch (error) {
        console.error(error);
    }
})();