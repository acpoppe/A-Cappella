const { SlashCommandBuilder } = require("@discordjs/builders");
const Song = require("../models/song.js");
const QueueManager = require("../models/queue-manager.js");
const ytdl = require("ytdl-core");
const ytsr = require("ytsr");

module.exports = {
    data: new SlashCommandBuilder().setName("playnow").setDescription("Plays song. If one is already playing, it ends immediately").addStringOption(option =>
		option.setName("input")
			.setDescription("The Youtube URL or search terms for the song or playlist to play")
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

        let name = "";
        if (!interaction.member.nickname) {
            name = interaction.user.username;
        } else {
            name = interaction.member.nickname;
        }

        let isPlaylistURL = false;
        let possibleURL = interaction.options.getString("input");
        
        var regExp = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
        var match = possibleURL.match(regExp);
        if (match && match[2]){
            isPlaylistURL = match[2];
        }

        if (!isPlaylistURL) {
            const validURL = await ytdl.validateURL(interaction.options.getString("input"));
            if (validURL) {
                let song = new Song(interaction.options.getString("input"), interaction.member.id, name);
                await song.getSongInfo();

                QueueManager.getInstance().playSong(song,
                    interaction.guildId,
                    interaction.channel,
                    voiceChannel);

                return await interaction.followUp({content: "Playing " + song.title});
            } else {
                const searchResults = await ytsr(interaction.options.getString("input"), {
                    limit: 1
                });
                
                if (searchResults) {
                    if (searchResults.items.length > 0) {
                        await interaction.followUp({content: "Searching"});

                        let song = new Song(searchResults.items[0].url, interaction.member.id, name);
                        await song.getSongInfo();
                        
                        QueueManager.getInstance().playSong(song,
                            interaction.guildId,
                            interaction.channel,
                            voiceChannel);

                        return await interaction.followUp({content: "Playing " + song.title});
                    }
                }
            }
        } else {
            return await interaction.followUp({content: "Is a playlist"});
        }
    }
};