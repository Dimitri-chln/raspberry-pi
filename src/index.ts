import "dotenv/config";

import Fs from "node:fs";
import Path from "node:path";

import Util from "./Util";

// Commands
const commandFiles = Fs.readdirSync(Path.join(__dirname, "commands"));
for (const commandFile of commandFiles) {
	const command =
		(require(Path.join(__dirname, "commands", commandFile)).default as RaspberryPi.Command) ??
		(require(Path.join(__dirname, "commands", commandFile)) as RaspberryPi.Command);

	Util.commands.set(command.name, command);
}

// Auto-complete handlers
const autocompleteHandlerFiles = Fs.readdirSync(Path.join(__dirname, "autocomplete-handlers"));
for (const autocompleteHandlerFile of autocompleteHandlerFiles) {
	const autocompleteHandler =
		(require(Path.join(__dirname, "autocomplete-handlers", autocompleteHandlerFile))
			.default as RaspberryPi.AutocompleteHandler) ??
		(require(Path.join(
			__dirname,
			"autocomplete-handlers",
			autocompleteHandlerFile,
		)) as RaspberryPi.AutocompleteHandler);

	Util.autocompleteHandlers.set(autocompleteHandler.name, autocompleteHandler);
}

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
