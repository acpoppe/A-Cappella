const { SlashCommandBuilder } = require("@discordjs/builders");
const QueueManager = require("../models/queue-manager");

module.exports = {
    data: new SlashCommandBuilder().setName("next").setDescription("Plays next song in queue if one exists"),
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

        if (QueueManager.getInstance().next(interaction.guildId,
            interaction.channel,
            voiceChannel)) {
            return await interaction.editReply("Playing next song");
        } else {
            return await interaction.editReply("No more songs on queue");
        }
    }
};