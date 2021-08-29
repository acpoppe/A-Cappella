const { AudioPlayerStatus } = require("@discordjs/voice");
const QueueManager = require("../../models/queue-manager.js");

module.exports = {
	name: AudioPlayerStatus.Idle,
	textChannel: null,
	voiceChannel: null,
	async execute() {
		if (QueueManager.getInstance().getIsAutoplayOn(this.voiceChannel.guildId) &&
		QueueManager.getInstance().getSongCountInQueue(this.voiceChannel.guildId) === 0) {
			await QueueManager.getInstance().autoplayNextSong(this.voiceChannel.guildId, this.textChannel, this.voiceChannel);
		} else {
			QueueManager.getInstance().clearCurrentlyPlaying(this.voiceChannel.guildId, this.textChannel, this.voiceChannel);
        	QueueManager.getInstance().next(this.voiceChannel.guildId, this.textChannel, this.voiceChannel);
		}
	}
};