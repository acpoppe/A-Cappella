const { SlashCommandBuilder } = require("@discordjs/builders");
const QueueManager = require("../models/queue-manager.js");

module.exports = {
    data: new SlashCommandBuilder().setName("notificationcheck").setDescription("Checks if notifications are on or off"),
    async execute(interaction) {
        if (QueueManager.getInstance().getNotificationIsOn(interaction.guildId)) {
            return await interaction.reply("Notifications turned ON");
        } else {
            return await interaction.reply("Notifications turned OFF");
        }
    }
};