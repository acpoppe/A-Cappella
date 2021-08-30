const { SlashCommandBuilder } = require("@discordjs/builders");
const QueueManager = require("../models/queue-manager.js");

module.exports = {
    data: new SlashCommandBuilder().setName("setvolume").setDescription("Sets the volume from 0 to 100").addIntegerOption(option =>
        option.setName("volume")
                .setDescription("The volume to play from 0 to 100")
                .setRequired(true)),
    async execute(interaction) {

        let voiceChannel = interaction.member.voice.channel;

        // Check if the user is in a voice channel
        if (!voiceChannel) {
            return await interaction.reply("You must be in a voice channel for me to work!");
        }

        let speechPermission = voiceChannel.speakable;
        let joinPermission = voiceChannel.joinable;
        
        // Check if the client can join and speak in the channel
        if (!joinPermission) {
            return await interaction.reply("I need permission to join the voice channel!");
        }
        if (!speechPermission) {
            return await interaction.reply("I need permission to speak in the voice channel!");
        }

        await interaction.deferReply();

        const volumeAmount = interaction.options.getInteger("volume");
        if (volumeAmount >= 0 && volumeAmount <= 100) {
            QueueManager.getInstance().setVolume(interaction.guildId, interaction.channel, voiceChannel, volumeAmount);

            return await interaction.followUp({content: "Volume changed!"});
        } else {
            return await interaction.followUp({content: "Volume must be between 0 and 100 inclusive"});
        }
    }
};