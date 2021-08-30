const DiscordVoice = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const fs = require("fs");
const Config = require("../config.json");


class ServerQueue {

    constructor(textChannel, voiceChannel) {
        this.volume = Config.defaultVolume;
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.songQueue = [];
        this.connection = null;
        this.currentlyPlayingSong = null;
        this.fairplay = false;
        this.autoplay = false;
        this.notification = true;
        this.resource = null;
        this.player = null;
        this.nextInsertIterator = 0;
    }

    joinVoiceChannel() {
        this.connection = DiscordVoice.joinVoiceChannel({
            channelId: this.voiceChannel.id,
            guildId: this.voiceChannel.guildId,
            adapterCreator: this.voiceChannel.guild.voiceAdapterCreator
        });
    }

    addSongToQueue(song, atPosition = -1) {
        if (this.fairplay) {
            this.songQueue.sort((a, b) => {
                return (a.insertIterator > b.insertIterator) ? 1 : -1;
            });
        }
        song.insertIterator = this.nextInsertIterator;
        this.nextInsertIterator++;
        if (atPosition < 0 || atPosition > this.songQueue.length - 1) {
            this.songQueue.push(song);
        } else {
            this.songQueue.splice(atPosition, 0, song);
        }

        this.recalculateIterators();

        if (this.fairplay) {
            this.sortFairplay();
        }

        if (this.currentlyPlayingSong === null) {
            this.playNext();
        }
    }

    recalculateIterators() {
        if (this.currentlyPlayingSong !== null) {
            this.currentlyPlayingSong.insertIterator = 0;
        }
        let newIterator = 1;

        this.songQueue.forEach((song) => {
            song.insertIterator = newIterator;
            newIterator++;
        });

        this.nextInsertIterator = newIterator;
    }

    playNext() {
        if (this.songQueue.length > 0) {
            this.currentlyPlayingSong = this.songQueue.shift();
        }

        if (this.player === null) {
            this.player = DiscordVoice.createAudioPlayer();

            /*
            * PLAYER EVENT HANDLING
            */
            const eventFiles = fs.readdirSync("./events/voice").filter(file => file.endsWith(".js"));

            for (const file of eventFiles) {
                const event = require(`../events/voice/${file}`);

                event.textChannel = this.textChannel;
                event.voiceChannel = this.voiceChannel;

                if (event.once) {
                    this.player.once(event.name, (...args) => event.execute(...args));
                } else {
                    this.player.on(event.name, (...args) => event.execute(...args));
                }
            }
        }

        const audioResourceOptions = {inlineVolume: true};
        const ytdlOptions = {filter: "audioonly", quality: "lowestaudio", highWaterMark: 1024 * 1024 * 10 * 10, bitrate: 96000};
        this.resource = DiscordVoice.createAudioResource(ytdl(this.currentlyPlayingSong.url, ytdlOptions), audioResourceOptions);
        this.resource.volume.setVolume(this.volume / 100);
        this.player.play(this.resource);
        this.connection.subscribe(this.player);
    }

    toggleFairplay() {
        if (this.fairplay) {
            // Sort back to normal
            this.songQueue.sort((a, b) => {
                return (a.insertIterator > b.insertIterator) ? 1 : -1;
            });
        } else {
            // Sort into fairplay
            this.sortFairplay();
        }
        this.fairplay = !this.fairplay;
    }

    toggleAutoplay() {
        this.autoplay = !this.autoplay;
    }

    toggleNotifications() {
        this.notification = !this.notification;
    }

    sortFairplay() {
        if (this.songQueue.length > 1) {
            this.songQueue.sort((a, b) => {
                return (a.requesterId > b.requesterId) ? 1 : (a.requesterId === b.requesterId) ? ((a.insertIterator > b.insertIterator) ? 1 : -1) : -1;
            });

            let newSongQueue = [];

            let counts = new Map();
            let sortedData = new Map();

            let totalCounts = [];

            for (const song of this.songQueue) {
                if (!counts.has(song.requesterId)) {
                    counts.set(song.requesterId, 0);
                    sortedData.set(song.requesterId, []);
                }

                counts.set(song.requesterId, counts.get(song.requesterId) + 1);
                sortedData.get(song.requesterId).push(song);
            }

            counts.forEach((value, key) => {
                totalCounts.push({key: key, value: value});
            });

            totalCounts.sort((a, b) => {
                return (a.value < b.value) ? 1 : -1;
            });

            let songIndex = 0;
            while (newSongQueue.length < this.songQueue.length) {
                for (const count of totalCounts) {
                    if (count.value > 0) {
                        newSongQueue.push(sortedData.get(count.key).shift());
                        count.value--;
                    }
                }
            }
            this.songQueue = newSongQueue;
        }
    }

    shuffle() {
        if (!this.fairplay) {
            for (let i = this.songQueue.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [this.songQueue[i], this.songQueue[j]] = [this.songQueue[j], this.songQueue[i]];
            }

            this.recalculateIterators();
        }
    }

    pause() {
        this.player.pause();
    }

    unpause() {
        this.player.unpause();
    }

    setVolume(amount) {
        this.volume = amount;
        this.resource.volume.setVolume(this.volume / 100);
    }

    skipTo(songPosition) {
        let pos = songPosition;
        while (pos <= this.songQueue.length && pos > 0) {
            this.currentlyPlayingSong = this.songQueue.shift();
            pos--;
        }

        const audioResourceOptions = {inlineVolume: true};
        const ytdlOptions = {filter: "audioonly", quality: "lowestaudio", highWaterMark: 1024 * 1024 * 10 * 10, bitrate: 96000};
        this.resource = DiscordVoice.createAudioResource(ytdl(this.currentlyPlayingSong.url, ytdlOptions), audioResourceOptions);
        this.resource.volume.setVolume(this.volume / 100);
        this.player.play(this.resource);
        this.connection.subscribe(this.player);
    }

    removeSong(songPosition) {
        if (songPosition > 0 && songPosition <= this.songQueue.length) {
            this.songQueue.splice(songPosition - 1, 1);
        }
    }

    leave() {
        this.player.stop();
    }
}

module.exports = ServerQueue;