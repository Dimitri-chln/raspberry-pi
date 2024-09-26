import { ApplicationCommandData, ApplicationCommandType, Client } from "discord.js";
import Util from "../Util";

import Fs from "node:fs";
import Path from "node:path";

const event: RaspberryPi.Event = {
	name: "ready",
	once: false,

	run: async (client: Client) => {
		console.log(`Logged in to Discord as ${Util.client.user.tag} (${Util.client.user.id})`);

		await Util.client.application.commands.fetch();

		const commandFiles = Fs.readdirSync(Path.join(__dirname, "commands"));
		for (const commandFile of commandFiles) {
			const command =
				(require(Path.join(__dirname, "commands", commandFile)).default as RaspberryPi.Command) ??
				(require(Path.join(__dirname, "commands", commandFile)) as RaspberryPi.Command);

			Util.commands.set(command.name, command);

			const applicationCommandData: ApplicationCommandData = {
				type: ApplicationCommandType.ChatInput,
				name: command.name,
				description: command.description,
				options: command.options,
			};

			const applicationCommand = Util.client.application.commands.cache.find((c) => c.name === command.name);
			if (!applicationCommand) Util.client.application.commands.create(applicationCommandData);
			else {
				if (!applicationCommand.equals(applicationCommandData))
					Util.client.application.commands.edit(applicationCommand, applicationCommandData);
			}
		}
	},
};

export default event;
