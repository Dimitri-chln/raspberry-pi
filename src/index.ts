import "dotenv/config";

import Util from "./Util";
import discordBot from "./discord-bot";
import startProcess from "./util/startProcess";

Util.processes.forEach((processConfig) => {
	if (processConfig.autoStart) startProcess(processConfig);
});

discordBot.login(process.env.DISCORD_TOKEN);
