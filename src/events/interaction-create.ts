import Util from "../Util";

import { ApplicationCommandOptionType, Interaction, InteractionType } from "discord.js";

const event: RaspberryPi.Event = {
	name: "interactionCreate",
	once: false,

	run: async (interaction: Interaction) => {
		switch (interaction.type) {
			case InteractionType.ApplicationCommand: {
				if (interaction.isChatInputCommand()) {
					const command = Util.commands.get(interaction.commandName);
					if (!command) return;

					try {
						await command.run(interaction);
					} catch (err) {
						console.error(err);

						if (interaction.replied) {
							interaction
								.followUp({
									content: `Quelque chose c'est mal passé en exécutant la commande </${interaction.command.name}:${interaction.command.id}>`,
									ephemeral: true,
								})
								.catch(console.error);
						} else {
							interaction
								.reply({
									content: `Quelque chose c'est mal passé en exécutant la commande </${interaction.command.name}:${interaction.command.id}>`,
									ephemeral: true,
								})
								.catch(console.error);
						}
					}
				}

				break;
			}

			case InteractionType.ApplicationCommandAutocomplete: {
				const autocompleteHandler = Util.autocompleteHandlers.get(interaction.commandName);

				if (!autocompleteHandler) return;

				const subCommandGroup = interaction.options.getSubcommandGroup(false);
				const subCommand = interaction.options.getSubcommand(false);
				const focusedOption = interaction.options.getFocused(true);

				const option = autocompleteHandler.options.find(
					(option) =>
						option.subCommandGroup === subCommandGroup &&
						option.subCommand === subCommand &&
						option.name === focusedOption.name,
				);

				if (!option) return;

				const results =
					option.type === ApplicationCommandOptionType.String
						? await option.run(interaction, focusedOption.value as string).catch(console.error)
						: await option.run(interaction, focusedOption.value as unknown as number).catch(console.error);

				if (!results) return;

				const finalResults = results
					.filter((result) => {
						switch (option.filterType) {
							case "STARTS_WITH": {
								return result.name.toLowerCase().startsWith(focusedOption.value.toString().toLowerCase());
							}

							case "CONTAINS": {
								return result.name.toLowerCase().includes(focusedOption.value.toString().toLowerCase());
							}
						}
					})
					.slice(0, 25);

				interaction.respond(finalResults).catch(console.error);

				break;
			}
		}
	},
};

export default event;
