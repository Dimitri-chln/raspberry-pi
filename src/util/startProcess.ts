import { CronJob } from "cron";
import Util from "../Util";
import spawnChildProcess from "./spawnChildProcess";

export default async function startProcess(processConfig: RaspberryPi.ProcessConfig): Promise<void> {
	// Process that start immediately
	if (!processConfig.cronTime) return await spawnChildProcess(processConfig);

	// Process with Cron time
	const job = new CronJob(
		processConfig.cronTime,
		async () => {
			await spawnChildProcess(processConfig);
		},
		null,
		true,
		Util.config.TIMEZONE,
	);

	Util.runningJobs.set(processConfig.name, job);
}
