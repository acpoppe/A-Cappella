const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder().setName("setvolume").setDescription("Sets the volume from X to Y"),
    async execute(interaction) {
        await interaction.reply("SetVolumePong!");
    }
};