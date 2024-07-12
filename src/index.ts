import "dotenv/config";

import Util from "./Util";
import discordBot from "./discord-bot";
import startProcess from "./util/startProcess";

Util.processes.forEach((processConfig: RaspberryPi.ProcessConfig) => {
	console.log(`Configuring process ${processConfig.name}...`);
	startProcess(processConfig);
});

discordBot.login(process.env.DISCORD_TOKEN);
