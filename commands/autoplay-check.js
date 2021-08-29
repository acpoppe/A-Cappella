const { SlashCommandBuilder } = require("@discordjs/builders");
const QueueManager = require("../models/queue-manager.js");

module.exports = {
    data: new SlashCommandBuilder().setName("autoplaycheck").setDescription("Checks if autoplay is on or off"),
    async execute(interaction) {
        if (QueueManager.getInstance().getIsAutoplayOn(interaction.guildId)) {
            return await interaction.reply("Autoplay turned ON");
        } else {
            return await interaction.reply("Autoplay turned OFF");
        }
    }
};