const ServerQueue = require("./server-queue.js");
const Song = require("./song.js");

class PrivateQueueManager {

    constructor() {
        this.queues = new Map();
    }

    playSong(song, serverId, textChannel, voiceChannel) {
        // If the music bot isn't in a channel, join the channel
        this.join(serverId, textChannel, voiceChannel);

        // Add song to both regular queue and autoplay queue
        const queue = this.getQueue(serverId, textChannel, voiceChannel);

        queue.addSongToQueue(song);

        // Begin playing
        queue.playNext();
    }

    addSongToEndOfQueue(song, serverId, textChannel, voiceChannel) {
        // If the music bot isn't in a channel, join the channel
        this.join(serverId, textChannel, voiceChannel);

        // Add song to both regular queue and autoplay queue
        const queue = this.getQueue(serverId, textChannel, voiceChannel);

        queue.addSongToQueue(song);
    }

    next(serverId, textChannel, voiceChannel) {
        // If the music bot isn't in a channel, join the channel
        this.join(serverId, textChannel, voiceChannel);

        // Add song to both regular queue and autoplay queue
        const queue = this.getQueue(serverId, textChannel, voiceChannel);

        if (queue.songQueue.length > 0) {
            queue.playNext();
            return true;
        } else {
            return false;
        }
    }

    clearCurrentlyPlaying(serverId, textChannel, voiceChannel) {
        const queue = this.getQueue(serverId, textChannel, voiceChannel);
        queue.currentlyPlayingSong = null;
    }

    addSongToNextInQueue() {

    }

    setVolume(serverId, textChannel, voiceChannel, volumeAmount) {
        const queue = this.getQueue(serverId, textChannel, voiceChannel);
        queue.setVolume(volumeAmount);
    }

    skipTo(serverId, textChannel, voiceChannel, songPosition) {
        const queue = this.getQueue(serverId, textChannel, voiceChannel);
        queue.skipTo(songPosition);
    }
    
    removeSong(serverId, textChannel, voiceChannel, songPosition) {
        const queue = this.getQueue(serverId, textChannel, voiceChannel);
        queue.removeSong(songPosition);
    }

    shuffle(serverId, textChannel, voiceChannel) {
        const queue = this.getQueue(serverId, textChannel, voiceChannel);
        queue.shuffle()
    }

    pauseQueue(serverId, textChannel, voiceChannel) {
        const queue = this.getQueue(serverId, textChannel, voiceChannel);
        queue.pause();
    }

    unpauseQueue(serverId, textChannel, voiceChannel) {
        const queue = this.getQueue(serverId, textChannel, voiceChannel);
        queue.unpause();
    }

    toggleFairplayForQueue(serverId, textChannel, voiceChannel) {
        const queue = this.getQueue(serverId, textChannel, voiceChannel);
        queue.toggleFairplay();
    }

    toggleAutoplayForQueue(serverId, textChannel, voiceChannel) {
        const queue = this.getQueue(serverId, textChannel, voiceChannel);
        queue.toggleAutoplay();
    }

    toggleNotificationsForQueue(serverId, textChannel, voiceChannel) {
        const queue = this.getQueue(serverId, textChannel, voiceChannel);
        queue.toggleNotifications();
    }

    clearQueue(serverId, textChannel, voiceChannel) {
        const queue = this.getQueue(serverId, textChannel, voiceChannel);
        queue.songQueue = [];
    }

    join(serverId, textChannel, voiceChannel) {
        const queue = this.getQueue(serverId, textChannel, voiceChannel);
        queue.joinVoiceChannel();
    }

    leave(serverId) {
        if (this.queues.has(serverId)) {
            this.queues.get(serverId).connection.destroy();
            this.queues.delete(serverId);
        }
    }

    search() {

    }
    
    getQueue(serverId, textChannel, voiceChannel) {
        if (this.queues.has(serverId)) {
            const queue = this.queues.get(serverId);
            queue.textChannel = textChannel;
            if (queue.connection !== null && queue.voiceChannel !== voiceChannel) {
                queue.voiceChannel = voiceChannel;
                this.join(serverId, textChannel, voiceChannel);
            } else {
                queue.voiceChannel = voiceChannel;
            }
            return queue;
        } else {
            this.queues.set(serverId, new ServerQueue(textChannel, voiceChannel));
            return this.queues.get(serverId);
        }
    }

    getIsAutoplayOn(serverId) {
        if (this.queues.has(serverId)) {
            return this.queues.get(serverId).autoplay;
        } else {
            return false;
        }
    }

    getIsFairplayOn(serverId) {
        if (this.queues.has(serverId)) {
            return this.queues.get(serverId).fairplay;
        } else {
            return false;
        }
    }

    getNotificationIsOn(serverId) {
        if (this.queues.has(serverId)) {
            return this.queues.get(serverId).notification;
        } else {
            return false;
        }
    }

    getVolume(serverId) {
        if (this.queues.has(serverId)) {
            return this.queues.get(serverId).volume;
        } else {
            return false;
        }
    }

    getSongCountInQueue(serverId) {
        if (this.queues.has(serverId)) {
            return this.queues.get(serverId).songQueue.length;
        } else {
            return -1;
        }
    }

    async autoplayNextSong(serverId, textChannel, voiceChannel) {
        const queue = this.getQueue(serverId, textChannel, voiceChannel);
        if (queue.currentlyPlayingSong !== null) {
            if (queue.currentlyPlayingSong.autoplayUrl) {

                let song = new Song(queue.currentlyPlayingSong.autoplayUrl,
                    queue.currentlyPlayingSong.requesterId,
                    queue.currentlyPlayingSong.requesterName);
                await song.getSongInfo();

                this.playSong(song,
                    serverId,
                    textChannel,
                    voiceChannel);
            }
        }
    }
}

class QueueManager {

    constructor() {
        throw new Error("Use QueueManager.getInstance()");
    }

    static getInstance() {
        if (!QueueManager.instance) {
            QueueManager.instance = new PrivateQueueManager();
        }
        return QueueManager.instance;
    }
}

module.exports = QueueManager;