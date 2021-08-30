const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const QueueManager = require("../models/queue-manager.js");
const pagination = require("discordjs-button-pagination");

module.exports = {
    data: new SlashCommandBuilder().setName("queue").setDescription("Shows the queue"),
    async execute(interaction) {
        if (QueueManager.getInstance().queues.has(interaction.guildId)) {
            const songsPerPage = 20;
            let songQueue = QueueManager.getInstance().queues.get(interaction.guildId).songQueue;
            let currentSong = QueueManager.getInstance().queues.get(interaction.guildId).currentlyPlayingSong;
            
            let pages = 0;
            if (songQueue.length > 0) {
                pages = Math.ceil(songQueue.length / songsPerPage);
            } else if (songQueue.length === 0) {
                pages = 1;
            }

            let embedPages = [];
            for (let i = 0; i < pages; i++) {
                const embed = new Discord.MessageEmbed()
                    .setColor("#0099FF")
                    .setAuthor("QUEUE - A Cappella", "https://allisonpoppe.com/acappella/dance.jpeg")
                    .setThumbnail("https://allisonpoppe.com/acappella/dance.jpeg")
                    .setTimestamp();

                if (i === 0) {
                    if (currentSong) {
                        let currentLength = new Date(currentSong.length * 1000).toISOString().substr(11, 8);
                        embed.addField("\u200B", "\u200B");
                        embed.addField("CURRENTLY PLAYING\t\t\t" + "Requested by " + currentSong.requesterName, "[" + currentSong.title + "](" + currentSong.url + ")" + " [" + currentLength.toString() + "]");
                        embed.addField("\u200B", "\u200B");
                    } else {
                        embed.addField("\u200B", "\u200B");
                        embed.addField("NOTHING CURRENTLY PLAYING", "\u200B");
                        embed.addField("\u200B", "\u200B");
                    }
                }

                let iterator = 1 + (i * songsPerPage);
                const pageStartIndex = (songsPerPage * i);
                let pageEndIndex = pageStartIndex + (songsPerPage);
                if (songQueue.length < pageEndIndex) {
                    pageEndIndex = songQueue.length;
                }
                for (let j = pageStartIndex; j < pageEndIndex; j++) {
                    let length = new Date(songQueue[j].length * 1000).toISOString().substr(11, 8);
                    embed.addField("Requested by " + songQueue[j].requesterName, iterator.toString() + "\t[" + songQueue[j].title + "](" + songQueue[j].url + ") [" + length.toString() + "]");
                    iterator++;
                }
                embedPages.push(embed);
            }

            const prevButton = new Discord.MessageButton()
                .setCustomId('previousbtn')
                .setLabel('Previous')
                .setStyle('SUCCESS');

            const nextButton = new Discord.MessageButton()
                .setCustomId('nextbtn')
                .setLabel('Next')
                .setStyle('SUCCESS');

            let buttons = [prevButton, nextButton];

            pagination(interaction, embedPages, buttons);
            return;
        } else {
            return await interaction.reply("There's nothing currently in the queue on this server");
        }
    }
};