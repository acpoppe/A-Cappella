const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder().setName("search").setDescription("Searches for a song"),
    async execute(interaction) {
        await interaction.reply("Search isn't implemented yet, but will be coming soon!");
    }
};