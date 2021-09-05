const { SlashCommandBuilder } = require("@discordjs/builders");
const Song = require("../models/song.js");
const QueueManager = require("../models/queue-manager.js");
const ytdl = require("ytdl-core");
const ytsr = require("ytsr");
const ytpl = require("ytpl");
const spotifypl = require("spotifypl");
const Config = require("../config.json");

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

        let name = "";
        if (!interaction.member.nickname) {
            name = interaction.user.username;
        } else {
            name = interaction.member.nickname;
        }

        let possibleURL = interaction.options.getString("input");

        if (!ytpl.validateID(possibleURL)) {
            const validURL = await ytdl.validateURL(interaction.options.getString("input"));
            if (validURL) {
                let song = new Song(interaction.options.getString("input"), interaction.member.id, name);
                await song.getSongInfo();

                QueueManager.getInstance().playSong(song,
                    interaction.guildId,
                    interaction.channel,
                    voiceChannel);

                return await interaction.followUp({content: "Playing " + song.title});
            } else if (Config.useSpotify && await spotifypl.validatePublicPlaylistURL(possibleURL, Config.spotifyClientId, Config.spotifyClientSecret)) {
                try {
                    let playlistId = spotifypl.getIdFromURL(possibleURL);
                    let results = await spotifypl(playlistId, Config.spotifyClientId, Config.spotifyClientSecret);
                    for (let i = 0; i < results.data.tracks.items.length; i++) {
                        if (results.data.tracks.items[i].track) {
                            const songTitle = results.data.tracks.items[i].track.name;
                            const songArtist = results.data.tracks.items[i].track.artists[0].name;
                            const searchResults = await ytsr(songTitle + " " + songArtist, {limit: 1});
                            if (searchResults) {
                                if (searchResults.items.length > 0) {

                                    if (searchResults.items[0].type && searchResults.items[0].type !== "playlist") {
            
                                        let song = new Song(searchResults.items[0].url, interaction.member.id, name);
                                        song.title = searchResults.items[0].title;
                                        
                                        let lengthHMS = searchResults.items[0].duration;
                                        let durationParts = lengthHMS.split(":");
                                        let lengthSeconds = 0;
                                        if (durationParts.length === 1) {
                                            lengthSeconds = +durationParts[0];
                                        } else if (durationParts.length === 2) {
                                            lengthSeconds = (+durationParts[0] * 60) + +durationParts[1];
                                        } else if (durationParts.length === 3) {
                                            lengthSeconds = (+durationParts[0] * 60 * 60) + (+durationParts[1] * 60) + +durationParts[2];
                                        }
                                        song.length = lengthSeconds;
                                        
                                        QueueManager.getInstance().addSongToQueueAtIndex(song,
                                            i,
                                            interaction.guildId,
                                            interaction.channel,
                                            voiceChannel);

                                        if (i == 0 && QueueManager.getInstance().getSongCountInQueue(interaction.guildId) > 0) {
                                            QueueManager.getInstance().next(interaction.guildId,
                                                interaction.channel,
                                                voiceChannel);
                                        }

                                    } else {
                                        // First search result is a playlist
                                    }
                                }
                            }
                        }
                    }

                    return await interaction.followUp({content: "Playing Spotify Playlist - " + results.data.name});
                } catch (e) {
                    console.log(e);
                    return await interaction.followUp({content: "There was an error adding your playlist"});
                }
            } else {
                const searchResults = await ytsr(interaction.options.getString("input"), {
                    limit: 1
                });
                
                if (searchResults) {
                    if (searchResults.items.length > 0) {

                        await interaction.followUp({content: "Searching"});

                        if (searchResults.items[0].type && searchResults.items[0].type !== "playlist") {

                            let song = new Song(searchResults.items[0].url, interaction.member.id, name);
                            await song.getSongInfo();
                            
                            QueueManager.getInstance().playSong(song,
                                interaction.guildId,
                                interaction.channel,
                                voiceChannel);

                            return await interaction.followUp({content: "Playing " + song.title});
                        } else {
                            // First search result is a playlist
                            return await interaction.followUp({contents: "The result was a playlist.  This will be fixed in future patch"});
                        }
                    }
                }
            }
        } else {
            ytplOptions = {limit: Infinity};
            const playlistResults = await ytpl(possibleURL, ytplOptions);
            for (let i = 0; i < playlistResults.items.length; i++) {
                let song = new Song(playlistResults.items[i].shortUrl, interaction.member.id, name);
                song.title = playlistResults.items[i].title;
                song.length = playlistResults.items[i].durationSec;

                QueueManager.getInstance().addSongToQueueAtIndex(song,
                    i,
                    interaction.guildId,
                    interaction.channel,
                    voiceChannel);

                if (i == 0 && QueueManager.getInstance().getSongCountInQueue(interaction.guildId) > 0) {
                    QueueManager.getInstance().next(interaction.guildId,
                        interaction.channel,
                        voiceChannel);
                }
            }
            return await interaction.followUp({content: "Added songs from playlist " + playlistResults.title});
        }
    }
};