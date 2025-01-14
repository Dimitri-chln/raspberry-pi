import Service from "./Service";

import Fs from "node:fs";
import FsAsync from "node:fs/promises";
import Path from "node:path";
import ChildProcess from "node:child_process";
import Axios from "axios";

import ServerProperties from "./MinecraftServerProperties";

export default class MinecraftServer extends Service<RaspberryPi.Events.MinecraftServer> {
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
	/**
	 * The name of the directory where the version file is saved
	 */
	readonly versionFile: string;

	constructor(name: string) {
		super(`minecraft@${name}`);

		this.serverName = name;
		this.serverDirectory = Path.join(process.env.MINECRAFT_PATH, "servers", name);
		this.backupsDirectory = Path.join(this.serverDirectory, "backups");
		this.versionFile = Path.join(this.serverDirectory, "version.lock");

		this.on("loading", (progress) => console.log(`Minecraft server ${this.serverName} is loading: ${progress}`));
		this.on("load", () => console.log(`Minecraft server ${this.serverName} is loaded`));
	}

	private async serverProperties(): Promise<ServerProperties> {
		const file = await FsAsync.readFile(Path.join(this.serverDirectory, "server.properties"), {
			encoding: "utf8",
		});
		return new ServerProperties(file);
	}

	private async saveServerProperties(serverProperties: ServerProperties): Promise<void> {
		await FsAsync.writeFile(Path.join(this.serverDirectory, "server.properties"), serverProperties.stringify());
	}

	private async version(): Promise<RaspberryPi.Minecraft.ServerVersion | null> {
		if (!Fs.existsSync(this.versionFile)) return null;
		return await FsAsync.readFile(this.versionFile, { encoding: "utf8" });
	}

	private async saveVersion(version: RaspberryPi.Minecraft.ServerVersion): Promise<void> {
		await FsAsync.writeFile(this.versionFile, version);
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

	async loadBackup(name: string): Promise<RaspberryPi.Minecraft.ServerVersion> {
		const backups = await this.backups();
		if (!backups.includes(name)) throw new Error("Invalid backup");

		const serverProperties = await this.serverProperties();
		serverProperties.set("level-name", `backups/${name}`);
		await this.saveServerProperties(serverProperties);

		// Load version and resource-pack
		const metadata = await this.metadata();
		const backupMetadata = metadata.backups?.find((backupMetadata) => backupMetadata.name === name);
		if (!backupMetadata) throw new Error("No metadata found for backup");

		const currentVersion = await this.version();
		if (!currentVersion || currentVersion !== backupMetadata.version) await this.updateServer(backupMetadata.version);
		if (backupMetadata.resourcePack) await this.enableResourcePack(backupMetadata.resourcePack);
		else await this.disableResourcePack();

		return this.version();
	}

	async loadWorld(): Promise<RaspberryPi.Minecraft.ServerVersion> {
		const serverProperties = await this.serverProperties();
		serverProperties.set("level-name", "world");
		await this.saveServerProperties(serverProperties);

		// Load version and resource-pack
		const metadata = await this.metadata();

		const currentVersion = await this.version();
		if (!currentVersion || currentVersion !== metadata.version) await this.updateServer(metadata.version);
		if (metadata.resourcePack) await this.enableResourcePack(metadata.resourcePack);
		else await this.disableResourcePack();

		return this.version();
	}

	async waitForServer(): Promise<void> {
		const PROGRESS_REGEX = /Preparing spawn area: (\d+)%/;
		const DONE_REGEX = /Done \(\d+\.\d+s\)!/;

		return new Promise((resolve, reject) => {
			this.watchLogs();

			let logCallback = (log: string) => {
				const [, progress] = log.match(PROGRESS_REGEX) ?? [];
				if (progress) this.emit("loading", parseInt(progress));

				if (DONE_REGEX.test(log)) {
					this.stopLogs();
					this.off("log", logCallback);
					this.emit("load");
					resolve();
				}
			};

			this.on("log", logCallback);
		});
	}

	private async metadata(): Promise<RaspberryPi.Minecraft.ServerMetadata> {
		const response = await Axios.get<RaspberryPi.Minecraft.ServerMetadata>(
			`${process.env.MINECRAFT_METADATA_URL}/servers/${this.serverName}.json`,
		);

		return response.data;
	}

	private async updateServer(version: RaspberryPi.Minecraft.ServerVersion): Promise<void> {
		const versionArg = version === "latest" ? "" : version;

		return new Promise((resolve, reject) => {
			ChildProcess.exec(
				`${process.env.MINECRAFT_SERVER_UPDATE_BIN} ${this.serverName} ${versionArg}`,
				async (error, stdout, stderr) => {
					if (error) return reject(error);
					await this.saveVersion(version);
					resolve();
				},
			);
		});
	}

	private async enableResourcePack(resourcePack?: RaspberryPi.Minecraft.ResourcePackMetadata): Promise<void> {
		const serverProperties = await this.serverProperties();

		const resourcePackUrl = `${process.env.MINECRAFT_METADATA_URL}/resource-packs/${resourcePack.uuid}.zip`;
		serverProperties.set("require-resource-pack", true);
		serverProperties.set("resource-pack", resourcePackUrl.replace(/([:=])/g, "\\$1"));
		serverProperties.set("resource-pack-id", resourcePack.uuid);
		serverProperties.set("resource-pack-sha1", resourcePack.checksum);

		await this.saveServerProperties(serverProperties);
	}

	private async disableResourcePack(): Promise<void> {
		const serverProperties = await this.serverProperties();

		serverProperties.set("require-resource-pack", false);
		serverProperties.set("resource-pack", null);
		serverProperties.set("resource-pack-id", null);
		serverProperties.set("resource-pack-sha1", null);

		await this.saveServerProperties(serverProperties);
	}
}
