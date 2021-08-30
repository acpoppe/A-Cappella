const Config = require("../config.json");

module.exports = {
	name: 'interactionCreate',
	execute(interaction) {
		if (Config.devMode) {
			console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
		}
	}
};