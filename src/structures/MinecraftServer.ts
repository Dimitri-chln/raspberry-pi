import Util from "../Util";
import Service from "./Service";

import Fs from "node:fs";
import FsAsync from "node:fs/promises";
import Path from "node:path";

import ServerProperties from "./MinecraftServerProperties";

export default class MinecraftServer extends Service {
	constructor(name: string) {
		super(`minecraft@${name}`);

		if (!Fs.existsSync(Path.join(Util.minecraftServersPath, name, "backups")))
			Fs.mkdirSync(Path.join(Util.minecraftServersPath, name, "backups"));
	}

	async serverProperties(): Promise<ServerProperties> {
		const file = await FsAsync.readFile(Path.join(Util.minecraftServersPath, this.name, "server.properties"), {
			encoding: "utf8",
		});
		return new ServerProperties(file);
	}

	async saveServerProperties(serverProperties: ServerProperties): Promise<void> {
		await FsAsync.writeFile(
			Path.join(Util.minecraftServersPath, this.name, "server.properties"),
			serverProperties.stringify(),
		);
	}

	async backups(): Promise<string[]> {
		const backups = await FsAsync.readdir(Path.join(Util.minecraftServersPath, this.name, "backups"));
		return backups;
	}

	async createBackup(): Promise<string> {
		const now = new Date();
		const yearString = now.getFullYear().toString().padStart(4, "0");
		const monthString = (now.getMonth() + 1).toString().padStart(2, "0");
		const dayString = now.getDate().toString().padStart(2, "0");
		const backupName = `backup-${yearString}-${monthString}-${dayString}-${now.getTime().toString(16)}`;

		await FsAsync.cp(
			Path.join(Util.minecraftServersPath, this.name, "world"),
			Path.join(Util.minecraftServersPath, this.name, "backups", backupName),
			{
				recursive: true,
			},
		);

		return backupName;
	}
}
