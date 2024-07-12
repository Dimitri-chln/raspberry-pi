import Util from "../Util";

export default function stopProcess(processConfig: RaspberryPi.ProcessConfig): void {
	if (processConfig.cronTime) {
		const job = Util.runningJobs.get(processConfig.name);
		job.stop();
	} else {
		const childProcess = Util.runningProcesses.get(processConfig.name);
		childProcess.kill();
	}
}
