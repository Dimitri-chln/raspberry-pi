import Fs from "node:fs";
import Path from "node:path";

import Util from "../Util";
import MinecraftServer from "../structures/MinecraftServer";

const task: RaspberryPi.Task = {
	intervalMs: 10_000,

	async action() {
		const minecraftServerNames = Fs.readdirSync(Path.join(process.env.MINECRAFT_PATH, "servers"));

		// Remove Minecraft servers that don't exist anymore
		Util.minecraftServers.sweep((_, minecraftServerName) => !minecraftServerNames.includes(minecraftServerName));

		// Add new Minecraft servers
		minecraftServerNames
			.filter((minecraftServerName) => !Util.minecraftServers.has(minecraftServerName))
			.forEach((minecraftServerName) =>
				Util.minecraftServers.set(minecraftServerName, new MinecraftServer(minecraftServerName)),
			);
	},
};

export default task;
