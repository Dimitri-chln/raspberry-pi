import Util from "../Util";

export default async function stopProcess(processConfig: RaspberryPi.ProcessConfig): Promise<void> {
	return new Promise((resolve, reject) => {
		if (processConfig.cronTime) {
			const job = Util.runningJobs.get(processConfig.name);
			job.stop();

			Util.runningJobs.delete(processConfig.name);
			resolve();
		} else {
			const childProcess = Util.runningProcesses.get(processConfig.name);

			childProcess.on("exit", resolve);
			childProcess.on("error", reject);

			// The - signs converts a pid to a group of pids
			process.kill(-childProcess.pid, "SIGTERM");
		}
	});
}
