import Util from "../Util";
import Service from "./Service";

import FsAsync from "node:fs/promises";
import Path from "node:path";
import ChildProcess from "node:child_process";

import ServerProperties from "./MinecraftServerProperties";

export default class MinecraftServer extends Service {
	constructor(name: string) {
		super(`minecraft@${name}`);

		// Create backup directory
		ChildProcess.execFileSync(process.env.CREATE_BACKUP_DIRECTORY_BIN, [name]);
	}

	async serverProperties(): Promise<ServerProperties> {
		const file = await FsAsync.readFile(Path.join(process.env.MINECRAFT_SERVERS_PATH, this.name, "server.properties"), {
			encoding: "utf8",
		});
		return new ServerProperties(file);
	}

	async saveServerProperties(serverProperties: ServerProperties): Promise<void> {
		await FsAsync.writeFile(
			Path.join(process.env.MINECRAFT_SERVERS_PATH, this.name, "server.properties"),
			serverProperties.stringify(),
		);
	}

	async backups(): Promise<string[]> {
		const backups = await FsAsync.readdir(Path.join(process.env.MINECRAFT_SERVERS_PATH, this.name, "backups"));
		return backups;
	}

	async createBackup(): Promise<string> {
		const now = new Date();
		const yearString = now.getFullYear().toString().padStart(4, "0");
		const monthString = (now.getMonth() + 1).toString().padStart(2, "0");
		const dayString = now.getDate().toString().padStart(2, "0");
		const backupName = `backup-${yearString}-${monthString}-${dayString}-${now.getTime().toString(16)}`;

		// Create backup (copy world in backup directory)
		ChildProcess.execFileSync(process.env.CREATE_BACKUP_BIN, [this.name, backupName]);

		return backupName;
	}
}
