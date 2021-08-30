const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const Config = require("../config.json");

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

async function getCommandsForServer(guildId) {
    try {
        const results = await rest.get(
            Routes.applicationGuildCommands(clientId, guildId)
        );

        return results;
    } catch (error) {
        console.error(error);
    }
}

async function deleteCommandFromServer(guildId, commandId) {
    try {
        const results = await rest.delete(
            Routes.applicationGuildCommand(clientId, guildId, commandId)
        );

        return results;
    } catch (error) {
        console.error(error);
    }
}

(async () => {
    for (let i = 0; i < Config.devGuildIds.length; i++) {
        const commands = await getCommandsForServer(Config.devGuildIds[i]);

        for (let j = 0; j < commands.length; j++) {
            await deleteCommandFromServer(Config.devGuildIds[i], commands[j].id);
        }
    }
    console.log("Deleted the bunch of 'em!");
})();