const { VoiceConnectionStatus } = require("@discordjs/voice");
const QueueManager = require("../../models/queue-manager.js");

module.exports = {
	name: VoiceConnectionStatus.Disconnected,
	textChannel: null,
	voiceChannel: null,
	async execute() {
        if (QueueManager.getInstance().queues.has(this.voiceChannel.guildId)) {
            QueueManager.getInstance().join(this.voiceChannel.guildId, this.textChannel, this.voiceChannel);
        }
	}
};