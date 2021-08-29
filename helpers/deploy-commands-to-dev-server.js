const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, clientIdDev, guildIdDev, guildIdDev2, token, devToken } = require("../config.json");
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
            Routes.applicationGuildCommands(clientId, guildIdDev),
            { body: commands }
        );

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildIdDev2),
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
            Routes.applicationGuildCommands(clientIdDev, guildIdDev),
            { body: commands }
        );

        await rest2.put(
            Routes.applicationGuildCommands(clientIdDev, guildIdDev2),
            { body: commands }
        );

        console.log("Successfully registered application commands");
    } catch (error) {
        console.error(error);
    }
})();