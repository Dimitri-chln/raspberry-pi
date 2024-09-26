import "dotenv/config";

import Fs from "node:fs";
import Path from "node:path";

import Util from "./Util";

// Events
const eventFiles = Fs.readdirSync(Path.resolve(__dirname, "events")).filter((file) => file.endsWith(".js"));
eventFiles.forEach((file) => {
	const path = Path.resolve(__dirname, "events", file);
	const event: RaspberryPi.Event = require(path).default ?? require(path);

	if (event.once) {
		Util.client.once(event.name, (...args) => event.run(...args).catch(console.error));
	} else {
		Util.client.on(event.name, (...args) => event.run(...args).catch(console.error));
	}
});

// Login
Util.client.login(process.env.DISCORD_TOKEN);
