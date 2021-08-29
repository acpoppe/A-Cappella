const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder().setName("playnext").setDescription("Adds new song next on queue"),
    async execute(interaction) {
        await interaction.reply("PlayNextPong!");
    }
};