import "dotenv/config";

import ChildProcess from "node:child_process";
import { CronJob } from "cron";

import Util from "./Util";
import discordBot from "./discord-bot";

Util.processes.forEach((processConfig: RaspberryPi.ProcessConfig) => {
	console.log(`Configuring process ${processConfig.name}...`);

	// Process that start immediately
	if (!processConfig.cronTime) return spawnChildProcess(processConfig);

	// Process with Cron time
	const job = new CronJob(
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

function spawnChildProcess(processConfig: RaspberryPi.ProcessConfig): void {
	const options: ChildProcess.ExecOptions = {
		cwd: processConfig.workingDirectory,
	};

	const childProcess = ChildProcess.exec("start.sh", options, (err) => {
		console.error(`Couldn't start process ${processConfig.name}: ${err}`);
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
