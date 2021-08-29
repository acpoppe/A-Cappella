const { SlashCommandBuilder } = require("@discordjs/builders");
const QueueManager = require("../models/queue-manager.js");

module.exports = {
    data: new SlashCommandBuilder().setName("fairplaycheck").setDescription("Checks if fairplay is on or off"),
    async execute(interaction) {
        if (QueueManager.getInstance().getIsFairplayOn(interaction.guildId)) {
            return await interaction.reply("Fairplay turned ON");
        } else {
            return await interaction.reply("Fairplay turned OFF");
        }
    }
};