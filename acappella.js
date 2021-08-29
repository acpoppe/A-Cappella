const Discord = require("discord.js");
const { token, devToken, devMode } = require("./config.json");
const fs = require("fs");
const QueueManager = require("./models/queue-manager.js");

/*
 * CLIENT INSTANTIATION
 */
const intents = new Discord.Intents;
intents.add(Discord.Intents.FLAGS.GUILDS);
intents.add(Discord.Intents.FLAGS.GUILD_MEMBERS);
intents.add(Discord.Intents.FLAGS.GUILD_VOICE_STATES);

const client = new Discord.Client({
    intents: intents
});

/*
 * QUEUE MANAGER INSTANTIATION
 */
const queueManager = QueueManager.getInstance();

/*
 * EVENT HANDLING
 */
const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

/*
 * COMMAND HANDLING
 */
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
}

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error executing this command!", ephemeral: true });
    }
});

if (devMode) {
    client.login(devToken);
} else {
    client.login(token)
}