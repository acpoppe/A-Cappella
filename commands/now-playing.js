const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const QueueManager = require("../models/queue-manager.js");

module.exports = {
    data: new SlashCommandBuilder().setName("nowplaying").setDescription("Displays currently playing song"),
    async execute(interaction) {
        await interaction.deferReply();
        if (QueueManager.getInstance().queues.has(interaction.guildId)) {
            if (QueueManager.getInstance().getNotificationIsOn(interaction.guildId)) {
                let currentSong = QueueManager.getInstance().queues.get(interaction.guildId).currentlyPlayingSong;
                const embed = new Discord.MessageEmbed()
                    .setColor("#0099FF")
                    .setAuthor("NOW PLAYING - A Cappella", "https://allisonpoppe.com/acappella/images/logo.png")
                    .setThumbnail("https://allisonpoppe.com/acappella/images/logo.png")
                    .setTimestamp()
                    .setFooter("by Allison Poppe", "https://allisonpoppe.com/acappella/images/logo.png");

                if (currentSong) {
                    let currentLength = new Date(currentSong.length * 1000).toISOString().substr(11, 8);
                    embed.addField("\u200B", "\u200B");
                    embed.addField("CURRENTLY PLAYING", "[" + currentSong.title + "](" + currentSong.url + ")");
                    embed.addField("Requested by " + currentSong.requesterName,  "Length: " + currentLength.toString());
                    embed.addField("Description", currentSong.description);
                } else {
                    embed.addField("\u200B", "\u200B");
                    embed.addField("NOTHING CURRENTLY PLAYING", "");
                    embed.addField("\u200B", "\u200B");
                }
                return await interaction.followUp({embeds: [embed]});
            }
        } else {
            return await interaction.followUp({content: "There's nothing currently playing on this server"});
        }
    }
};