const { SlashCommandBuilder } = require("@discordjs/builders");
const QueueManager = require("../models/queue-manager.js");

module.exports = {
    data: new SlashCommandBuilder().setName("volumecheck").setDescription("Checks if the value of the volume"),
    async execute(interaction) {
        if (QueueManager.getInstance().queues.has(interaction.guildId)) {
            return interaction.reply("Volume is set at " + QueueManager.getInstance().getVolume(interaction.guildId).toString());
        } else {
            return interaction.reply("I'm not currently active in this server");
        }
    }
};