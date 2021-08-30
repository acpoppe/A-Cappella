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

async function getCommands() {
    try {
        const results = await rest.get(
            Routes.applicationCommands(clientId)
        );

        return results;
    } catch (error) {
        console.error(error);
    }
}

async function deleteCommand(commandId) {
    try {
        const results = await rest.delete(
            Routes.applicationCommand(clientId, commandId)
        );

        return results;
    } catch (error) {
        console.error(error);
    }
}

(async () => {
    const commands = await getCommands();

    for (let i = 0; i < commands.length; i++) {
        await deleteCommand(commands[i].id);
    }
    console.log("Deleted the bunch of 'em!");
})();