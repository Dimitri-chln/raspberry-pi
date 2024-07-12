import ChildProcess from "node:child_process";
import Cron from "cron";

import Util from "./Util";
import discordBot from "./discord-bot";

Util.processes.forEach((processConfig: RaspberryPi.ProcessConfig) => {
	// Process that start immediately
	if (!processConfig.cronTime) return spawnChildProcess(processConfig);

	// Process with Cron time
	const job = new Cron.CronJob(
		processConfig.cronTime,
		() => {
			spawnChildProcess(processConfig);
		},
		null,
		true,
		Util.config.TIMEZONE,
	);

	Util.runningJobs.set(processConfig.name, job);
});

function spawnChildProcess(processConfig: RaspberryPi.ProcessConfig) {
	const childProcess = ChildProcess.spawn(Util.config.START_COMMAND, {
		cwd: processConfig.workingDirectory,
	});

	childProcess.on("spawn", () => {
		Util.runningProcesses.set(processConfig.name, childProcess);
		console.log(`Starting process ${processConfig.name}`);
	});

	childProcess.on("exit", (code, signal) => {
		if (!Number.isInteger(code)) return;

		Util.runningProcesses.delete(processConfig.name);
		console.log(`Process ${processConfig.name} stopped with exit code ${code}`);
	});
}

discordBot.login(process.env.DISCORD_TOKEN);
