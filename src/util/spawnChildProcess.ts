import Path from "node:path";
import Os from "node:os";
import ChildProcess from "node:child_process";

import Util from "../Util";
import startProcess from "./startProcess";

export default async function spawnChildProcess(processConfig: RaspberryPi.ProcessConfig): Promise<void> {
	return new Promise((resolve, reject) => {
		const options: ChildProcess.SpawnOptionsWithoutStdio = {
			cwd: Path.join(Os.homedir(), processConfig.workingDirectory),
			detached: true,
		};

		const childProcess = ChildProcess.spawn(
			Path.join(Os.homedir(), processConfig.workingDirectory, "start.sh"),
			options,
		);

		childProcess.on("spawn", () => {
			Util.runningProcesses.set(processConfig.name, childProcess);
			console.log(`Process ${processConfig.name} has been started (PID: ${childProcess.pid})`);
			resolve();
		});

		childProcess.on("exit", (code, signal) => {
			Util.runningProcesses.delete(processConfig.name);
			console.log(`Process ${processConfig.name} stopped with exit code ${code}`);

			if (code && code != 0 && processConfig.restartOnFailure) startProcess(processConfig);
		});

		childProcess.on("error", (err) => {
			console.error(`Process ${processConfig.name} encountered an error: ${err}`);
		});
	});
}
