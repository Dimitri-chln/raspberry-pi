import config from "./config.json";
import processes from "./processes.json";

import { ChildProcess } from "node:child_process";
import { Collection } from "discord.js";
import { CronJob } from "cron";

export default class Util {
	static readonly config = config;
	static readonly processes: RaspberryPi.ProcessConfig[] = processes;

	static readonly runningProcesses: Collection<string, ChildProcess> = new Collection();
	static readonly runningJobs: Collection<string, CronJob> = new Collection();
}
