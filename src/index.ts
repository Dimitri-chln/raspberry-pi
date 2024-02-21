import Fs from "fs";
import Path from "path";

import Dotenv from "dotenv";
import {
	ApplicationCommandData,
	ApplicationCommandType,
	Client,
	GatewayIntentBits,
	InteractionType,
	Partials,
} from "discord.js";

import { Command } from "./types";
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
			require(Path.join(__dirname, "commands", commandFile)).default ??
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
});

client.on("interactionCreate", async (interaction) => {
	switch (interaction.type) {
		case InteractionType.ApplicationCommand: {
			if (interaction.isChatInputCommand()) {
				const command = Util.commands.get(interaction.commandName);
				if (!command) return;

				command.run(interaction);
			}
		}
	}
});

client.login(process.env.DISCORD_TOKEN);
