import { ApplicationCommandData, ApplicationCommandType, Client } from "discord.js";
import Util from "../Util";

const event: RaspberryPi.Event = {
	name: "ready",
	once: false,

	run: async (client: Client) => {
		console.log(`Logged in to Discord as ${Util.client.user.tag} (${Util.client.user.id})`);

		await Util.client.application.commands.fetch();

		Util.commands.forEach((command) => {
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
		});
	},
};

export default event;
