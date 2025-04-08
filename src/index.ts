import "dotenv/config";

import Fs from "node:fs";
import Path from "node:path";

import Util from "./Util";

// Commands
const commandFiles = Fs.readdirSync(Path.join(__dirname, "commands"));
for (const commandFile of commandFiles) {
	const path = Path.join(__dirname, "commands", commandFile);
	const command: RaspberryPi.Discord.Command = require(path).default ?? require(path);

	Util.commands.set(command.name, command);
}

// Auto-complete handlers
const autocompleteHandlerFiles = Fs.readdirSync(Path.join(__dirname, "autocomplete-handlers"));
for (const autocompleteHandlerFile of autocompleteHandlerFiles) {
	const path = Path.join(__dirname, "autocomplete-handlers", autocompleteHandlerFile);
	const autocompleteHandler: RaspberryPi.Discord.AutocompleteHandler = require(path).default ?? require(path);

	Util.autocompleteHandlers.set(autocompleteHandler.name, autocompleteHandler);
}

// Events
const eventFiles = Fs.readdirSync(Path.resolve(__dirname, "events"));
eventFiles.forEach((file) => {
	const path = Path.resolve(__dirname, "events", file);
	const event: RaspberryPi.Discord.Event = require(path).default ?? require(path);

	if (event.once) {
		Util.client.once(event.name, (...args) => event.run(...args).catch(console.error));
	} else {
		Util.client.on(event.name, (...args) => event.run(...args).catch(console.error));
	}
});

// Login
Util.client.login(process.env.DISCORD_TOKEN);

// Tasks
const taskFiles = Fs.readdirSync(Path.resolve(__dirname, "tasks"));
taskFiles.forEach((file) => {
	const path = Path.resolve(__dirname, "tasks", file);
	const task: RaspberryPi.Task = require(path).default ?? require(path);

	setInterval(task.action, task.intervalMs);
});
