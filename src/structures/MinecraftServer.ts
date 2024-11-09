import Service from "./Service";

import FsAsync from "node:fs/promises";
import Path from "node:path";
import Axios from "axios";

import ServerProperties from "./MinecraftServerProperties";

export default class MinecraftServer extends Service {
	/**
	 * The name of the server
	 */
	readonly serverName: string;
	/**
	 * The name of the directory where the server is saved
	 */
	readonly serverDirectory: string;
	/**
	 * The name of the directory where the server backups are saved
	 */
	readonly backupsDirectory: string;

	constructor(name: string) {
		super(`minecraft@${name}`);
		this.serverName = name;
		this.serverDirectory = Path.join(process.env.MINECRAFT_PATH, "servers", name);
		this.backupsDirectory = Path.join(process.env.MINECRAFT_PATH, "servers", name, "backups");
	}

	async serverProperties(): Promise<ServerProperties> {
		const file = await FsAsync.readFile(Path.join(this.serverDirectory, "server.properties"), {
			encoding: "utf8",
		});
		return new ServerProperties(file);
	}

	async saveServerProperties(serverProperties: ServerProperties): Promise<void> {
		await FsAsync.writeFile(Path.join(this.serverDirectory, "server.properties"), serverProperties.stringify());
	}

	async backups(): Promise<string[]> {
		const backups = await FsAsync.readdir(this.backupsDirectory);
		return backups;
	}

	async createBackup(): Promise<string> {
		const now = new Date();
		const yearString = now.getFullYear().toString().padStart(4, "0");
		const monthString = (now.getMonth() + 1).toString().padStart(2, "0");
		const dayString = now.getDate().toString().padStart(2, "0");
		const backupName = `backup-${yearString}-${monthString}-${dayString}-${now.getTime().toString(16)}`;

		await FsAsync.cp(Path.join(this.serverDirectory, "world"), Path.join(this.backupsDirectory, backupName), {
			recursive: true,
		});

		return backupName;
	}

	async loadBackup(name: string): Promise<void> {
		const backups = await this.backups();
		if (!backups.includes(name)) throw new Error("Invalid backup");

		const serverProperties = await this.serverProperties();
		serverProperties.set("level-name", `backups/${name}`);
		await this.saveServerProperties(serverProperties);
	}

	async loadWorld(): Promise<void> {
		const serverProperties = await this.serverProperties();
		serverProperties.set("level-name", "world");
		await this.saveServerProperties(serverProperties);
	}

	async toggleResourcePack(enable: boolean): Promise<void> {
		const serverProperties = await this.serverProperties();

		if (enable) {
			let metadata: RaspberryPi.MinecraftResourcePackMetadata = {
				uuid: null,
				checksum: null,
			};

			try {
				metadata = (
					await Axios.get<RaspberryPi.MinecraftResourcePackMetadata>(
						`${process.env.MINECRAFT_RESOURCE_PACKS_URL}/metadata/${this.serverName}`,
					)
				).data;
			} catch (err) {
				console.error(err);
			}

			serverProperties.set("require-resource-pack", true);
			serverProperties.set("resource-pack", `${process.env.MINECRAFT_RESOURCE_PACKS_URL}/${this.serverName}`);
			serverProperties.set("resource-pack-id", metadata.uuid);
			serverProperties.set("resource-pack-sha1", metadata.checksum);
		} else {
			serverProperties.set("require-resource-pack", false);
			serverProperties.set("resource-pack", null);
			serverProperties.set("resource-pack-id", null);
			serverProperties.set("resource-pack-sha1", null);
		}
	}
}
