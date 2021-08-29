const ytdl = require("ytdl-core");

class Song {

    constructor(url, requesterId, requesterName) {
        this.title = "";
        this.url = url;
        this.requesterId = requesterId;
        this.requesterName = requesterName;
        this.length = 0;
        this.description = "";
        this.autoplayUrl = "";
        this.insertIterator = -1;
    }

    async getSongInfo() {
        const songInfo = await ytdl.getInfo(this.url);
        this.title = songInfo.videoDetails.title;
        this.length = songInfo.videoDetails.lengthSeconds;
        this.description = songInfo.videoDetails.description;
        this.autoplayUrl = "https://www.youtube.com/watch?v=" + songInfo.related_videos[0].id;
    }
}

module.exports = Song;