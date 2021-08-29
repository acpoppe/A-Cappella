const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const QueueManager = require("../models/queue-manager.js");

module.exports = {
    data: new SlashCommandBuilder().setName("queue").setDescription("Shows the queue"),
    async execute(interaction) {
        await interaction.deferReply();
        if (QueueManager.getInstance().queues.has(interaction.guildId)) {
            let songQueue = QueueManager.getInstance().queues.get(interaction.guildId).songQueue;
            let currentSong = QueueManager.getInstance().queues.get(interaction.guildId).currentlyPlayingSong;
            const embed = new Discord.MessageEmbed()
                .setColor("#0099FF")
                .setAuthor("QUEUE - A Cappella", "https://allisonpoppe.com/acappella/dance.jpeg")
                .setThumbnail("https://allisonpoppe.com/acappella/dance.jpeg")
                .setTimestamp()
                .setFooter("by Allison Poppe", "https://allisonpoppe.com/acappella/dance.jpeg");

            if (currentSong) {
                let currentLength = new Date(currentSong.length * 1000).toISOString().substr(11, 8);
                embed.addField("\u200B", "\u200B");
                embed.addField("CURRENTLY PLAYING\t\t\t" + "Requested by " + currentSong.requesterName + "\t\t\tLength: " + currentLength.toString(), "[" + currentSong.title + "](" + currentSong.url + ")");
                embed.addField("\u200B", "\u200B");
            } else {
                embed.addField("\u200B", "\u200B");
                embed.addField("NOTHING CURRENTLY PLAYING", "\u200B");
                embed.addField("\u200B", "\u200B");
            }
            let iterator = 1;
            for (const song of songQueue) {
                let length = new Date(song.length * 1000).toISOString().substr(11, 8);
                embed.addField("Requested by " + song.requesterName + "\t\t\tLength: " + length.toString(), iterator.toString() + "\t[" + song.title + "](" + song.url + ")");
                iterator++;
            }
            return await interaction.followUp({embeds: [embed]});
        } else {
            return await interaction.followUp({content: "There's nothing currently in the queue on this server"});
        }
    }
};