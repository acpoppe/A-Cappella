const Config = require("../config.json");

module.exports = {
	name: "voiceStateUpdate",
	execute(oldMember, newMember) {
        if (Config.devMode) {
		    // console.log("Voice State Update!");
        }
	}
};