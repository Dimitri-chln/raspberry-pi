import { ApplicationCommandData, ApplicationCommandType, Client } from "discord.js";
import Util from "../Util";

const event: RaspberryPi.Discord.Event = {
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
			if (!applicationCommand) Util.client.application.commands.create(applicationCommandData).catch(console.error);
			else {
				if (!applicationCommand.equals(applicationCommandData))
					Util.client.application.commands.edit(applicationCommand, applicationCommandData).catch(console.error);
			}
		});

		Util.client.application.commands.cache.forEach((applicationCommand) => {
			if (!Util.commands.has(applicationCommand.name)) {
				applicationCommand.delete().catch(console.error);
			}
		});
	},
};

export default event;
