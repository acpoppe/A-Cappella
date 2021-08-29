const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, token, clientIdDev, devToken } = require("../config.json");
const fs = require("fs");

const commands = [];
const commandFiles = fs.readdirSync("../commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands.push(command.data.toJSON());
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

const rest2 = new REST({ version: "9" }).setToken(devToken);

(async () => {
    try {
        await rest2.put(
            Routes.applicationCommands(clientIdDev),
            { body: commands }
        );

        console.log("Successfully registered application commands");
    } catch (error) {
        console.error(error);
    }
})();