import Fs from "fs";
import Path from "path";

import Dotenv from "dotenv";
import {
	ApplicationCommandData,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	Client,
	GatewayIntentBits,
	InteractionType,
	Partials,
} from "discord.js";

import { AutocompleteHandler, Command } from "./types";
import Util from "./Util";

Dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
	allowedMentions: {
		repliedUser: true,
		parse: ["users"],
	},
});

client.on("ready", async () => {
	console.log(`Logged in to Discord as ${client.user.tag} (${client.user.id})`);

	await client.application.commands.fetch();

	const commandFiles = Fs.readdirSync(Path.join(__dirname, "commands"));
	for (const commandFile of commandFiles) {
		const command =
			(require(Path.join(__dirname, "commands", commandFile)).default as Command) ??
			(require(Path.join(__dirname, "commands", commandFile)) as Command);

		Util.commands.set(command.name, command);

		const applicationCommandData: ApplicationCommandData = {
			type: ApplicationCommandType.ChatInput,
			name: command.name,
			description: command.description,
			options: command.options,
		};

		const applicationCommand = client.application.commands.cache.find((c) => c.name === command.name);
		if (!applicationCommand) client.application.commands.create(applicationCommandData);
		else {
			if (!applicationCommand.equals(applicationCommandData))
				client.application.commands.edit(applicationCommand, applicationCommandData);
		}
	}

	const autocompleteHandlerFiles = Fs.readdirSync(Path.join(__dirname, "autocomplete-handlers"));
	for (const autocompleteHandlerFile of autocompleteHandlerFiles) {
		const autocompleteHandler =
			(require(Path.join(__dirname, "autocomplete-handlers", autocompleteHandlerFile))
				.default as AutocompleteHandler) ??
			(require(Path.join(__dirname, "autocomplete-handlers", autocompleteHandlerFile)) as AutocompleteHandler);

		Util.autocompleteHandlers.set(autocompleteHandler.name, autocompleteHandler);
	}
});

client.on("interactionCreate", async (interaction) => {
	switch (interaction.type) {
		case InteractionType.ApplicationCommand: {
			if (interaction.isChatInputCommand()) {
				const command = Util.commands.get(interaction.commandName);
				if (!command) return;

				command.run(interaction);
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

			interaction.respond(finalResults);

			break;
		}
	}
});

client.login(process.env.DISCORD_TOKEN);
