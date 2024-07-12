import Path from "node:path";
import Os from "node:os";
import ChildProcess from "node:child_process";

import Util from "../Util";

export default async function spawnChildProcess(processConfig: RaspberryPi.ProcessConfig): Promise<void> {
	return new Promise((resolve, reject) => {
		const options: ChildProcess.ExecOptions = {
			cwd: Path.join(Os.homedir(), processConfig.workingDirectory),
		};

		const childProcess = ChildProcess.exec(
			Path.join(Os.homedir(), processConfig.workingDirectory, "start.sh"),
			options,
			(err, stdout, stderr) => {
				if (err) {
					console.error(`Couldn't start process ${processConfig.name}: ${err}`);
					reject(err);
				}
			},
		);

		childProcess.on("spawn", () => {
			Util.runningProcesses.set(processConfig.name, childProcess);
			console.log(`Starting process ${processConfig.name}`);
			resolve();
		});

		childProcess.on("exit", (code, signal) => {
			if (!Number.isInteger(code)) return;

			Util.runningProcesses.delete(processConfig.name);
			console.log(`Process ${processConfig.name} stopped with exit code ${code}`);
		});
	});
}
