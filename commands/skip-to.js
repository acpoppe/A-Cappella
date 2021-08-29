const { SlashCommandBuilder } = require("@discordjs/builders");
const QueueManager = require("../models/queue-manager.js");

module.exports = {
    data: new SlashCommandBuilder().setName("skipto").setDescription("Skips to specified song number in queue").addIntegerOption(option =>
        option.setName("position")
                .setDescription("The position of the song given by the /queue command")
                .setRequired(true)),
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

        const songPosition = interaction.options.getInteger("position");
        if (songPosition > 0 && songPosition <= QueueManager.getInstance().getSongCountInQueue(interaction.guildId)) {
            QueueManager.getInstance().skipTo(interaction.guildId, interaction.channel, voiceChannel, songPosition);
            return await interaction.followUp({content: "Skipped to your song"});
        } else {
            return await interaction.followUp({content: "That's not a valid song position.  Use the /queue command"});
        }
    }
};