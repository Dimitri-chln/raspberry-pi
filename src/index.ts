import "dotenv/config";

import Util from "./Util";
import discordBot from "./discord-bot";
import startProcess from "./util/startProcess";

Util.processes.forEach(startProcess);
discordBot.login(process.env.DISCORD_TOKEN);
