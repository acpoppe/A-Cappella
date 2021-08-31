const { AudioPlayerStatus } = require("@discordjs/voice");
const QueueManager = require("../../models/queue-manager.js");
const Discord = require("discord.js");

module.exports = {
	name: "stateChange",
	textChannel: null,
	voiceChannel: null,
	async execute(oldState, newState) {
        if (newState.status === AudioPlayerStatus.Playing && oldState.status === AudioPlayerStatus.Buffering && QueueManager.getInstance().queues.has(this.voiceChannel.guildId)) {
            if (QueueManager.getInstance().getNotificationIsOn(this.voiceChannel.guildId)) {
                let song = QueueManager.getInstance().queues.get(this.voiceChannel.guildId).currentlyPlayingSong;
                if (song !== null) {
                    const playingEmbed = new Discord.MessageEmbed()
                    .setColor("#0099FF")
                    .setAuthor("STARTING SONG - A Cappella", "https://allisonpoppe.com/acappella/images/logo.png")
                    .setThumbnail("https://allisonpoppe.com/acappella/images/logo.png")
                    .setTimestamp()
                    .setFooter("by Allison Poppe", "https://allisonpoppe.com/acappella/images/logo.png");

                    let currentLength = new Date(song.length * 1000).toISOString().substr(11, 8);
                    playingEmbed.addField("\u200B", "\u200B");
                    playingEmbed.addField("PLAYING", "[" + song.title + "](" + song.url + ")");
                    playingEmbed.addField("Requested by " + song.requesterName,  "Length: " + currentLength.toString());

                    this.textChannel.send({embeds: [playingEmbed]});
                }
            }
        }
	}
};