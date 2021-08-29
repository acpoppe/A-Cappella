const { SlashCommandBuilder } = require("@discordjs/builders");
const QueueManager = require("../models/queue-manager.js");

module.exports = {
    data: new SlashCommandBuilder().setName("fairplay").setDescription("Toggles on Fairplay"),
    async execute(interaction) {

        let voiceChannel = interaction.member.voice.channel;

        // Check if the user is in a voice channel
        if (!voiceChannel) {
            return await interaction.reply("You must be in a voice channel for me to work!");
        }

        let speechPermission = voiceChannel.speakable
        let joinPermission = voiceChannel.joinable
        
        // Check if the client can join and speak in the channel
        if (!joinPermission) {
            return await interaction.reply("I need permission to join the voice channel!");
        }
        if (!speechPermission) {
            return await interaction.reply("I need permission to speak in the voice channel!");
        }

        await interaction.deferReply();

        QueueManager.getInstance().toggleFairplayForQueue(interaction.guildId,
            interaction.channel,
            voiceChannel);

        if (QueueManager.getInstance().getIsFairplayOn(interaction.guildId)) {
            return await interaction.followUp({content: "Fairplay turned ON"});
        } else {
            return await interaction.followUp({content: "Fairplay turned OFF"});
        }
    }
};