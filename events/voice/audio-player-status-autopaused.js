const { AudioPlayerStatus } = require("@discordjs/voice");
const QueueManager = require("../../models/queue-manager.js");

module.exports = {
	name: AudioPlayerStatus.AutoPaused,
	textChannel: null,
	voiceChannel: null,
	async execute() {
        if (QueueManager.getInstance().queues.has(this.voiceChannel.guildId)) {
            QueueManager.getInstance().leave(this.voiceChannel.guildId);
        }
	}
};